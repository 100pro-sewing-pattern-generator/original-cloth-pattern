FROM python:3.9

WORKDIR /workspace

RUN apt-get update && apt-get install -y \
    git \
    wget \
    unzip \
    && rm -rf /var/lib/apt/lists/*

COPY Garment-Pattern-Estimation ./Garment-Pattern-Estimation
COPY Garment-Pattern-Generator ./Garment-Pattern-Generator

RUN pip install --upgrade pip

RUN pip install meson meson-python ninja

RUN pip install torch==2.8.0 torchvision==0.23.0 torchaudio==2.8.0

RUN pip install torch-scatter -f https://data.pyg.org/whl/torch-2.8.0+cpu.html

RUN pip install \
    torch-scatter \
    torch-sparse \
    torch-cluster \
    -f https://data.pyg.org/whl/torch-2.8.0+cpu.html

RUN pip install --no-build-isolation -r Garment-Pattern-Estimation/requirements.txt
ENV PYTHONPATH="/workspace/Garment-Pattern-Generator/packages"

WORKDIR /workspace/Garment-Pattern-Estimation

CMD ["uvicorn", "nn.evaluation_scripts.server:app", "--host", "0.0.0.0", "--port", "8000"]