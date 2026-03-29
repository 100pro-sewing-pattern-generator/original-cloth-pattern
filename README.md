# original-cloth-pattern
## 実行方法
## git clone
`git clone git@github.com:100pro-sewing-pattern-generator/original-cloth-pattern.git`

`cd original-cloth-pattern`

## データとモデルのダウンロード
### supportデータのダウンロード
以下のリンクから必要なデータをダウンロードしてください：

https://drive.google.com/file/d/1ylz5EoVFPmEAhO1cwUjO_zfa-oz5n608/view

ダウンロード後解体し、`support_data` 、/backend/mesh-generator/demo/dress_demo/に配置してください。

### ICONのダウンロード
`https://icon.is.tue.mpg.de/` ここでユーザーネームと、パスワードを入力しサインインします

![gallery](./assets/register.png) ユーザー名の下の `Register for other projects` をクリックし、SMPL, SMPL-X, SMPLIFYのprojectの`Register now`をおし、Yesにします。

下の二つのコマンドで、ダウンロードします。

`bash backend/mesh-generator/demo/dress_demo/1_coarse/ICON_get_smpl/fetch_data.sh`

`bash backend/mesh-generator/demo/dress_demo/1_coarse/ICON_get_smpl/fetch_hps.sh`

### 背景除去モデルのダウンロード
`mkdir -p ./models`

`wget https://github.com/danielgatis/rembg/releases/download/v0.0.0/u2net.onnx -O ./models/u2net.onnx`

## DockerのImageの作成
`docker compose pull`
`docker compose build`

## コンテナの作成
`docker compose down`

`docker compsoe up`

### 動作確認
`http://localhost:5173/`をブラウザに貼り付ける

画像をアップロードすると、左にアップロードされた画像、真ん中に3D画像、右に型パターンが表示されます。
![gallery](./assets/demo.png)
