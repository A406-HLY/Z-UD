import re
from .morph_analyzer import MorphAnalyzer
from .blacklist import BlacklistFilter
class CandidateExtractor:
    """
    품질 필터링과 정규화가 강화된 후보 키워드 추출기
    """
    def __init__(self, analyzer=None):
        self.analyzer = analyzer or MorphAnalyzer()
        self.blacklist_filter = BlacklistFilter()
    def run(self, text):
        """
        텍스트에서 고품질 후보 명사 리스트 추출
        """
        clean_text = self._preprocess(text)
        raw_candidates = self.analyzer.analyze(clean_text)
        final_candidates = []
        for word in raw_candidates:
            norm_word = word.upper() if word.lower() in ["ltv", "dsr"] else word
            if norm_word not in self.blacklist_filter.blacklist:
                final_candidates.append(norm_word)
        return final_candidates
    def _preprocess(self, text):
        """
        분석 전 텍스트 정제
        """
        text = re.sub(r'[\s\(\)\[\]\{\},:;!·]', ' ', text)
        return text.strip()
