import re
import json
from simhash import Simhash

# 特徴抽出関数
def get_features(s):
    width = 3
    s = s.lower()
    s = re.sub(r'[\s\n]+', '', s)  # 空白と改行文字を削除
    return [s[i:i + width] for i in range(max(len(s) - width + 1, 1))]

# データ
SLOW_FILE = 'codes_slow.json'
FAST_FILE = 'codes_fast.json'

# 遅いコードデータ
try:
    with open(SLOW_FILE, "r", encoding='utf-8') as f:
        codes_slow = json.load(f)
except UnicodeDecodeError:
        print(f"Skipping file due to encoding issue: {SLOW_FILE}")
# 速いコードデータ
try:
    with open(FAST_FILE, "r", encoding='utf-8') as f:
        codes_fast = json.load(f)
except UnicodeDecodeError:
        print(f"Skipping file due to encoding issue: {FAST_FILE}")


# Simhash オブジェクトを作成
hashes = {key: Simhash(get_features(value)) for key, value in codes_slow.items()}

# 入力値
input_string = "now = new Date()"
input_hash = Simhash(get_features(input_string))

# 閾値とビット長
threshold = 0.8
bit_length = 64

# 類似した文字列のキー
similar_keys = []
# 近似重複キーを取得
for key, hash_obj in hashes.items():
    distance = input_hash.distance(hash_obj)
    similarity = 1 - (distance / bit_length)
    if similarity >= threshold:
        similar_keys.append(key)

# 出力
if similar_keys:
    print(f"類似した文字列のキー: {similar_keys}")
    for slow_key in similar_keys:
        # 正規表現で数字を抽出
        numbers = re.findall(r'\d+', slow_key)
        fast_key = "fast" + str(numbers[0])

        # マッチしたslowコードに対応するfastコードを検索
        print(fast_key)
        fast_code = codes_fast[fast_key].strip().replace('\n', ' ')  # 改行文字を半角スペースに置換
        print(fast_code)
        print()
else:
    print("類似した文字列が見つかりませんでした。")
