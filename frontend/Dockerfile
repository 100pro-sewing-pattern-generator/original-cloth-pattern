# ベースイメージ
FROM node:22-alpine

# 作業ディレクトリを作成
WORKDIR /app

# 依存関係を先にコピーしてインストール（キャッシュ利用用）
COPY package.json package-lock.json ./
RUN npm install

# アプリケーションのソースをコピー
COPY . .

ENV HOST 0.0.0.0