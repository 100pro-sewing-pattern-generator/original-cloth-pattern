FROM python:3.8

WORKDIR /workspace

# OSパッケージ
RUN apt-get update && apt-get install -y git build-essential cmake libjpeg-dev libpng-dev

# pip 最新化
RUN pip install --upgrade pip

# -------------------------
# PyTorch 系を先にインストールしてキャッシュ
RUN pip install torch==1.13.1 torchvision==0.14.1 torchaudio==0.13.1 \
    -f https://download.pytorch.org/whl/torch_stable.html \
    && pip install pytorch-lightning==1.9.5

RUN pip install --upgrade pip wheel setuptools
# RUN pip install --global-option=build_ext --global-option="-j$(nproc)" openmesh==1.2.1
# pybind11 / OpenMesh / PyTorch3D
RUN pip install pybind11
# RUN pip install "pytorch3d==0.7.1" -f https://dl.fbaipublicfiles.com/pytorch3d/packaging/wheels/py38_cpu_pyt1310/download.html

# それ以外の依存関係
COPY requirements.txt .
RUN pip install --no-build-isolation -r requirements.txt

RUN apt-get install -y libopenmesh-dev
RUN pip install --global-option=build_ext --global-option="-j$(nproc)" openmesh


RUN pip install git+https://github.com/facebookresearch/pytorch3d.git

RUN pip install uvicorn fastapi

RUN pip install pillow-avif-plugin

RUN pip install python-multipart
# アプリコードを最後にコピー
COPY . /workspace/GarVerseLOD
WORKDIR /workspace/GarVerseLOD/demo/dress_demo/

CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8000"]