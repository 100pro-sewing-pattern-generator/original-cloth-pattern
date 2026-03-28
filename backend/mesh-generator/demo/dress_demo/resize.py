from PIL import Image
import os
import pillow_avif
from rembg import remove

def _next_power_of_2(n):
    return 1 if n == 0 else 2**(n - 1).bit_length()

def resize_to_512(filepath: str) -> str:
    img = Image.open(filepath).convert("RGB")

    resample = getattr(Image, "Resampling", Image).LANCZOS
    resized = img.resize((512, 512), resample)

    base = os.path.splitext(filepath)[0]
    new_path = base + ".png"

    resized.save(new_path, format="PNG")
    return new_path

def resize_to_power_of_two(filepath: str) -> str:
    img = Image.open(filepath).convert("RGB")
    w, h = img.size
    new_w = _next_power_of_2(w)
    new_h = _next_power_of_2(h)

    resample = getattr(Image, "Resampling", Image).LANCZOS
    resized = img.resize((new_w, new_h), resample)

    base = os.path.splitext(filepath)[0]
    new_path = base + ".png"

    resized.save(new_path, format="PNG")
    return new_path

def remove_background(file_path, bg_color=(127,127,127)) -> str:
    """
    背景を切り抜きつつ、透過部分を bg_color で埋めて RGB 3チャンネルにする
    """
    img = Image.open(file_path).convert("RGBA")  # rembgは透過生成
    result = remove(img)  # 背景削除

    # 背景塗りつぶし用に新しい画像作成
    bg = Image.new("RGB", result.size, bg_color)
    # 透過部分を bg_color で埋める
    bg.paste(result, mask=result.split()[3])  # アルファチャンネルをマスクとして貼り付け

    # 保存
    base = os.path.splitext(file_path)[0]
    new_path = base + ".png"
    bg.save(new_path, format="PNG")

    if new_path != file_path:
        os.remove(file_path)  # 元ファイル削除

    return new_path