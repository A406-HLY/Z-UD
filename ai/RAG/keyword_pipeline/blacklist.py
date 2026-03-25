from .config import BLACKLIST

class BlacklistFilter:
    """
    범용적이거나 무의미한 단어를 필터링하는 클래스
    """
    def __init__(self, custom_blacklist=None):
        self.blacklist = set(BLACKLIST)
        if custom_blacklist:
            self.blacklist.update(custom_blacklist)

    def filter(self, word_list):
        """
        블랙리스트에 포함된 단어 제외
        """
        return [word for word in word_list if word not in self.blacklist]

if __name__ == "__main__":
    # 간단한 테스트
    f = BlacklistFilter()
    sample = ["대출", "상환능력", "심사", "규제지역", "기준"]
    print(f"Original: {sample}")
    print(f"Filtered: {f.filter(sample)}")
