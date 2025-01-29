import re
import json

from simhash import Simhash

SLOW_FILE = '../data/codes_slow.json'
FAST_FILE = '../data/codes_fast.json'

class ChangeCode:
    def __init__(self, slow_code_plain):
        self.slow_code_plain = slow_code_plain
        self.threshold = 0.8
        self.bit_length = 64
    
    def get_features(self, s):
        """特徴を抽出する関数

        Args:
            s (str): 生のコード

        Returns:
            list: ハッシュ値に与える特徴
        """
        width = 3
        s = s.lower()
        s = re.sub(r'[\s\n]+', '', s)  # 空白と改行文字を削除
        return [s[i:i + width] for i in range(max(len(s) - width + 1, 1))]
    
    def read_codes(self, json_file):
        """JSONファイルを読み込む関数

        Args:
            json_file (str): JSONファイルのパス

        Returns:
            dict: JSONファイルの内容
        """
        try:
            with open(json_file, "r", encoding='utf-8') as f:
                codes = json.load(f)
            return codes
        except UnicodeDecodeError:
            print(f"Skipping file due to encoding issue: {json_file}")
            
    def get_similar_keys(self, codes_slow_hash, input_hash):
        """類似したキーを取得する関数

        Args:
            codes_slow_hash (dict): 遅いコードのハッシュ一覧の辞書
            input_hash (int): 入力されたコードハッシュ

        Returns:
            list: 入力されたコードハッシュに近いコードのキー
        """
        similar_keys = []
        # 近似重複キーを取得
        for key, hash_obj in codes_slow_hash.items():
            distance = input_hash.distance(hash_obj)
            similarity = 1 - (distance / self.bit_length)
            if similarity >= self.threshold:
                similar_keys.append(key)
        return similar_keys
            
    def main(self):
        """遅いコードを速いコードに変換する関数

        Returns:
            list: 早いコードのリスト
        """
        codes_slow = self.read_codes(SLOW_FILE)
        codes_fast = self.read_codes(FAST_FILE)
        
        codes_slow_hash = {key: Simhash(self.get_features(value)) for key, value in codes_slow.items()}
        code_slow_hash = Simhash(self.get_features(self.slow_code_plain))
        
        similar_keys = self.get_similar_keys(codes_slow_hash, code_slow_hash)
                
        # 出力
        fast_codes = []
        if similar_keys:
            print(f"類似した文字列のキー: {similar_keys}")
            for slow_key in similar_keys:
                # 正規表現で数字を抽出
                numbers = re.findall(r'\d+', slow_key)
                fast_key = "fast" + str(numbers[0])

                # マッチしたslowコードとそれに対応するfastコードを検索
                slow_code = codes_slow[slow_key].strip().replace('\n', ' ')  # 改行文字を半角スペースに置換
                fast_code = codes_fast[fast_key].strip().replace('\n', ' ')  # 改行文字を半角スペースに置換
                fast_codes.append({
                    'fast':fast_code,
                    'slow':slow_code
                })
                print(f"早いコード: {fast_codes}")
        else:
            print("類似した文字列が見つかりませんでした。")
            
        return fast_codes
