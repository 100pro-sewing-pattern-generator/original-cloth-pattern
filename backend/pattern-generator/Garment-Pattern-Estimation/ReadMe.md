# セットアップ（Mac）

## 1. 本レポジトリのクローン

```bash
git clone git@github.com:100pro-sewing-pattern-generator/Garment-Pattern-Estimation.git
cd Garment-Pattern-Estimation
```

---

## 2. Minicondaのインストール

```bash
wget https://repo.anaconda.com/miniconda/Miniconda3-latest-MacOSX-arm64.sh
bash Miniconda3-latest-MacOSX-arm64.sh -b
```

### PATHの設定

```bash
export PATH="$HOME/miniconda3/bin:$PATH"
```

---

## 3. conda環境の作成

```bash
conda create -n Garments python=3.9
conda activate Garments
```

---

## 4. 依存関係のインストール

```bash
pip install -r requirements.txt
```

---

## 5. Garment-Pattern-Generator レポジトリのクローン

以下のレポジトリを **Garment-Pattern-Estimation と同じ階層** にクローンします。

```bash
cd ..
git clone git@github.com:100pro-sewing-pattern-generator/Garment-Pattern-Generator.git
```

この時点でのディレクトリ構造は以下のようになります。

```
100pro
├─ Garment-Pattern-Estimation
└─ Garment-Pattern-Generator
```

---

## 6. 評価データのダウンロード

以下のリンクからデータセットをダウンロードします。

https://zenodo.org/records/5267549

1. `test.zip` をダウンロード  
2. 解凍して `test` フォルダを取得  

Finderで **Garments-dataset** フォルダを作成し、その中に `test` フォルダを配置します。

```
Garments-dataset
└─ test
```

その後、**Garments-dataset** フォルダを以下の場所に配置します。

```
100pro
├─ Garment-Pattern-Estimation
├─ Garment-Pattern-Generator
└─ Garments-dataset
   └─ test
      ├─ dress_150
      ├─ jacket_hood_sleevess_150
      └─ ...
```

---

## 7. dataset path の設定

1. **Garments-dataset** フォルダを右クリック  
2. **Copy Path** を選択  
3. コピーされたパスを以下のファイルに設定します。

```
Garment-Pattern-Estimation/system.json
```

以下の項目に貼り付けます。

```
datasets_path="コピーしたパス"
```

---

## 8. PYTHONPATH の設定

`Garment-Pattern-Estimation` から  
`Garment-Pattern-Generator` の `package` フォルダを利用するため、  
`PYTHONPATH` を設定します。

1. `Garment-Pattern-Generator` 内の **package フォルダ**を右クリック  
2. **Copy Path** を選択  
3. 以下のコマンドの `path` をコピーしたパスに置き換えて実行します

```bash
export PYTHONPATH="コピーしたPath"
```

---

## 9. 実行（評価）

以下のコマンドを実行します。

```bash
cd Garment-Pattern-Estimation
python nn/evaluation_scripts/on_test_set.py \
-sh models/att/att.yaml \
-st models/att/stitch_model.yaml \
--unseen \
--predict
```

評価結果は以下のフォルダに保存されます。

```
outputs
```