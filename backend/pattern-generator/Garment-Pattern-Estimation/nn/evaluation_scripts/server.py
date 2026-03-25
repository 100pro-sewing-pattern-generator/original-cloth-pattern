from fastapi import FastAPI, UploadFile, File
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware

from pathlib import Path
import shutil
import torch
import sys
import zipfile
import yaml
import numpy as np
from datetime import datetime

# -------------------------------
# Path設定
# -------------------------------
BASE_DIR = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(BASE_DIR / "nn"))

# -------------------------------
# モジュールimport
# -------------------------------
from evaluation_scripts.predict_per_example import (
    sample_points_obj,
    load_points
)

import customconfig
import data
from experiment import ExperimentWrappper
from pattern.wrappers import VisPattern

import numpy as np

import trimesh

def scale_obj(input_path, output_path, sample_path="sample.obj"):

    mesh_input = trimesh.load(input_path)
    mesh_sample = trimesh.load(sample_path)

    size_input = mesh_input.bounding_box.extents
    size_sample = mesh_sample.bounding_box.extents

    scale_factor = (size_sample / size_input).mean()

    mesh_input.apply_scale(scale_factor)

    mesh_input.export(str(output_path))

    return output_path

# -------------------------------
# FastAPI
# -------------------------------
app = FastAPI()
origins = ["http://localhost:5173"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # または ["*"] で全て許可
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------
# 出力フォルダ
# -------------------------------
OUTPUT_DIR = BASE_DIR / "api_outputs"
OUTPUT_DIR.mkdir(exist_ok=True)

# -------------------------------
# config読み込み
# -------------------------------
system_info = customconfig.Properties(BASE_DIR / "system.json")

shape_config_path = BASE_DIR / "models/att/att.yaml"
stitch_config_path = BASE_DIR / "models/att/stitch_model.yaml"

with open(shape_config_path) as f:
    shape_config = yaml.safe_load(f)

with open(stitch_config_path) as f:
    stitch_config = yaml.safe_load(f)

# -------------------------------
# device
# -------------------------------
device = "cuda:0" if torch.cuda.is_available() else "cpu"

# -------------------------------
# モデルロード
# -------------------------------
print("Loading models...")

shape_experiment = ExperimentWrappper(
    shape_config,
    system_info["wandb_username"]
)

stitch_experiment = ExperimentWrappper(
    stitch_config,
    system_info["wandb_username"]
)

shape_model = shape_experiment.load_model()
shape_model.eval()

stitch_model = stitch_experiment.load_model()
stitch_model.eval()

_, _, data_config = shape_experiment.data_info()
_, _, stitch_data_config = stitch_experiment.data_info()

print("Models loaded")

# -------------------------------
# API
# -------------------------------
@app.post("/predict")
async def predict(file: UploadFile = File(...)):

    # run directory
    run_dir = OUTPUT_DIR / datetime.now().strftime("%Y%m%d_%H%M%S")
    run_dir.mkdir(parents=True)

    # save uploaded file
    input_path = run_dir / file.filename

    with open(input_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # -------------------------------
    # point cloud loading
    # -------------------------------
    if ".obj" in file.filename:
        scaled_path = run_dir / "scaled.obj"

        scale_obj(
            input_path=input_path,
            output_path=scaled_path
        )
        points = sample_points_obj(
            scaled_path,
            shape_config["dataset"]["mesh_samples"]
        )
    else:
        points = load_points(input_path)

    # sample points if needed
    if abs(points.shape[0] - data_config["mesh_samples"]) > 10:
        selection = np.random.permutation(points.shape[0])[:data_config["mesh_samples"]]
        points = points[selection]

    # standardize
    if "standardize" in data_config:
        points = (
            points - data_config["standardize"]["f_shift"]
        ) / data_config["standardize"]["f_scale"]

    # tensor
    points_tensor = torch.tensor(points).float().unsqueeze(0).to(device)

    # -------------------------------
    # shape prediction
    # -------------------------------
    with torch.no_grad():
        predictions = shape_model(points_tensor)

    save_dir = run_dir / "output"
    save_dir.mkdir()

    names = [VisPattern.name_from_path(input_path)]

    data.save_garments_prediction(
        predictions,
        save_dir,
        data_config,
        names,
        stitches_from_stitch_tags="stitch"
        in shape_experiment.NN_config()["loss"]["loss_components"],
    )

    svg_file = save_dir / "tpose/tpose_pattern.svg"

    # -------------------------------
    # download
    # -------------------------------
    return FileResponse(
        svg_file,
        media_type="image/svg+xml",
        filename=svg_file.name
    )