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
        # 1. 전처리를 통한 노이즈 제거
        clean_text = self._preprocess(text)
        
        # 2. 형태소 분석 및 전략적 병합 기반 명사 추출
        raw_candidates = self.analyzer.analyze(clean_text)
        
        # 3. 정규화 및 블랙리스트 필터링
        final_candidates = []
        for word in raw_candidates:
            # 대소문자 정규화 (특히 LTV, DSR 등)
            norm_word = word.upper() if word.lower() in ["ltv", "dsr"] else word
            
            # 블랙리스트 제외
            if norm_word not in self.blacklist_filter.blacklist:
                final_candidates.append(norm_word)
                
        return final_candidates

    def _preprocess(self, text):
        """
        분석 전 텍스트 정제
        """
        # 줄바꿈 및 특수문자 공백화 (토큰 깨짐 방지)
        text = re.sub(r'[\s\(\)\[\]\{\},:;!·]', ' ', text)
        return text.strip()
