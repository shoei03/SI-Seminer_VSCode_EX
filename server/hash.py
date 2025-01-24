from simhash import Simhash
 
 
def get_simhash_similarity(code1, code2):
    hash1 = Simhash(code1)
    hash2 = Simhash(code2)
    distance = hash1.distance(hash2)
    return 1 - (distance / 64)  # ハミング距離を基に類似性スコア計算
 
 
code1 = "FUNCTION_1.apply(1000, [2, 3, 4]);"
code2 = "FUNCTION_1.apply(2344, [1,5,9,2,4,5,3]);"
similarity = get_simhash_similarity(code1, code2)
print(f"SimHash Similarity: {similarity}")