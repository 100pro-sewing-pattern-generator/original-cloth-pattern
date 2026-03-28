from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse, FileResponse
from pathlib import Path
import shutil
import subprocess
import os
from datetime import datetime
from resize import resize_to_power_of_two, remove_background, resize_to_512
from PIL import Image
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

origins = [
    "http://localhost:5173",  # React (Vite)
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = Path(__file__).parent
IMG_DIR = BASE_DIR / "inputs/imgs"
OUTPUT_DIR = BASE_DIR / "outputs/temp"

@app.post("/image-to-obj")
async def imageToObj(file: UploadFile = File(...)):
    try:
        # ----------------------------
        # 時間フォルダ作成 (inputs/imgs と outputs/temp 両方)
        # ----------------------------
        time_folder = datetime.now().strftime("%Y%m%d_%H%M%S")
        img_time_dir = IMG_DIR / time_folder
        img_time_dir.mkdir(parents=True, exist_ok=True)

        coarse_temp_dir = OUTPUT_DIR / "coarse_temp" / time_folder
        coarse_temp_dir.mkdir(parents=True, exist_ok=True)

        coarse_garment_dir = OUTPUT_DIR / "coarse_garment" / time_folder
        coarse_garment_dir.mkdir(parents=True, exist_ok=True)

        # ----------------------------
        # 入力画像保存
        # ----------------------------

        # 入力画像のresize
        file_path = img_time_dir / file.filename
        with open(file_path, "wb") as f:
            shutil.copyfileobj(file.file, f)

        if file_path.suffix.lower() == ".avif":
            img = Image.open(file_path).convert("RGB")
            png_path = os.path.splitext(file_path)[0] + ".png"
            img.save(png_path)
            os.remove(file_path)  # 元の AVIF 削除
            file_path = png_path

        file_path = resize_to_512(file_path)
        file_path = remove_background(file_path)


        logs = {}

        # ----------------------------
        # 0_normal_estimator
        # ----------------------------
        result0 = subprocess.run(
            [
                "python",
                str(BASE_DIR / "0_normal_estimator/predict_normal.py"),
                "--input_dir", str(img_time_dir),
                "--output_dir", str(OUTPUT_DIR)
            ],
            check=True,
            capture_output=True,
            text=True,
            cwd=str(BASE_DIR / "0_normal_estimator")
        )
        logs["normal_estimator"] = {"stdout": result0.stdout, "stderr": result0.stderr}

        # ----------------------------
        # 1_coarse/ICON_get_smpl
        # ----------------------------
        env_icon = os.environ.copy()
        env_icon["CUDA_VISIBLE_DEVICES"] = "0"

        result1 = subprocess.run(
            [
                "python", "-m", "apps.infer_smpl",
                "-cfg", "./configs/icon-filter.yaml",
                "-gpu", "0",
                "-in_dir", str(img_time_dir),
                "-out_dir", str(coarse_temp_dir),
                "-export_video",
                "-loop_smpl", "1",
                "-loop_cloth", "200",
                "-hps_type", "pymaf"
            ],
            check=True,
            capture_output=True,
            text=True,
            cwd=str(BASE_DIR / "1_coarse/ICON_get_smpl"),
            env=env_icon
        )
        logs["infer_smpl"] = {"stdout": result1.stdout, "stderr": result1.stderr}

        # ----------------------------
        # 1_coarse/tpose_garment_estimator
        # ----------------------------
        env_tpose = os.environ.copy()
        env_tpose["CUDA_VISIBLE_DEVICES"] = "0"

        result2 = subprocess.run(
            [
                "python", "test_wild.py",
                "--in_folder", str(img_time_dir),
                "--out_folder", str(coarse_temp_dir)
            ],
            check=True,
            capture_output=True,
            text=True,
            cwd=str(BASE_DIR / "1_coarse/tpose_garment_estimator"),
            env=env_tpose
        )
        logs["tpose_garment"] = {"stdout": result2.stdout, "stderr": result2.stderr}

        # ----------------------------
        # 1_coarse/smpl_lbs_to_garment/pose_garment.py
        # ----------------------------
        env_pose = os.environ.copy()
        env_pose["CUDA_VISIBLE_DEVICES"] = "0"

        result3 = subprocess.run(
            [
                "python", "pose_garment.py",
                "--in_folder", str(img_time_dir),
                "--out_folder", str(coarse_garment_dir),
                "--temp", str(coarse_temp_dir)
            ],
            check=True,
            capture_output=True,
            text=True,
            cwd=str(BASE_DIR / "1_coarse/smpl_lbs_to_garment"),
            env=env_pose
        )
        logs["pose_garment"] = {"stdout": result3.stdout, "stderr": result3.stderr}

        file_stem = Path(file_path).stem

        obj_path = coarse_temp_dir / f"{file_stem}_tpose_spbs_garment.obj"

        return FileResponse(
            path=str(obj_path),
            media_type="application/octet-stream",
            filename= f"{file_stem}_tpose_smpl_garment.obj"
        )

    except subprocess.CalledProcessError as e:
        print(e)
        return JSONResponse(content={
            "status": "error",
            "file_saved": str(file_path),
            "script_stdout": e.stdout,
            "script_stderr": e.stderr
        }, status_code=500)