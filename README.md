# original-cloth-pattern
## 実行方法
## git clone
`git clone git@github.com:100pro-sewing-pattern-generator/original-cloth-pattern.git`

`cd original-cloth-pattern`

### DockerのImageの作成
`docker compose build`

### コンテナの作成
`docker compose down`

`docker compsoe up`

### 動作確認
#### UI確認
`http://localhost:5173/`をブラウザに貼り付ける

objファイルをアップロードして、見えることを確認

#### backend確認
##### pattern estimator
`http://localhost:8002/docs`をブラウザで叩くと緑色のPOST /predictを押すとTry it outというボタンが出てくるので、押すとファイル選択ができる

ここでobjファイルを選択すると、ResponseでDownlod fileができるので、それを押すと型の写真が出てくる
