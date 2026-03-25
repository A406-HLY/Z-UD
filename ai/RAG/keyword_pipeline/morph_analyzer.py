import sys
import re
from kiwipiepy import Kiwi
from .config import PROTECTED_TERMS, MAX_COMPOUND_LEN, MAX_COMPOUND_WORDS

class MorphAnalyzer:
    """
    엄격한 명사 추출 및 지능형 복합 명사 병합을 지원하는 형태소 분석기 (Kiwi 버전)
    """
    def __init__(self):
        self.protected_terms = set(PROTECTED_TERMS)
        self.kiwi = Kiwi()

    def analyze(self, text):
        """
        텍스트를 분석하여 품질 필터링이 적용된 명사(단일/복합) 리스트 반환
        """
        if not self.kiwi:
            return []

        # 1. 원문에서 보호 용어(Protected Terms) 우선 추출 (띄어쓰기 무시 매칭)
        protected_found = []
        temp_text = text
        for term in sorted(self.protected_terms, key=len, reverse=True):
            # 용어 사이의 띄어쓰기를 허용하는 정규표현식 생성
            pattern = r'\s*'.join([re.escape(char) for char in term])
            matches = re.findall(pattern, temp_text)
            if matches:
                # 매칭된 원형 대신 표준화된 term 저장
                protected_found.extend([term] * len(matches))
                # 매칭된 영역 마스킹
                temp_text = re.sub(pattern, " " * len(term), temp_text)

        # 2. 형태소 분석 및 동적 병합 (Kiwi)
        nouns = []
        tokens = self.kiwi.tokenize(temp_text)
        
        current_sequence = []
        for token in tokens:
            surface = token.form
            feature = token.tag
            
            # SL(외래어/알파벳), NNG(일반명사), NNP(고유명사)만 허용
            is_valid_pos = False
            if feature in ["NNG", "NNP", "SL"]:
                is_valid_pos = True
            
            if is_valid_pos and len(surface) > 0:
                # 불필요한 기호 제거 및 정규화
                clean_surface = re.sub(r'[^가-힣A-Za-z0-9]', '', surface)
                if clean_surface:
                    current_sequence.append(clean_surface)
            else:
                # 명사 시퀀스가 끊기면 병합 시도
                if current_sequence:
                    self._process_sequence(current_sequence, nouns)
                    current_sequence = []
            
        # 마지막 시퀀스 처리
        if current_sequence:
            self._process_sequence(current_sequence, nouns)

        # 3. 모든 결과 통합
        final_nouns = nouns + protected_found
        
        # 4. 최종 정제 (1글자 무시, 너무 긴 토큰 무시)
        return [n for n in final_nouns if 1 < len(n) <= MAX_COMPOUND_LEN]

    def _process_sequence(self, sequence, result_list):
        """
        명사 시퀀스를 병합 규칙에 따라 처리
        """
        # 제약 조건 내에서 병합
        if len(sequence) <= MAX_COMPOUND_WORDS:
            merged = "".join(sequence)
            if len(merged) <= MAX_COMPOUND_LEN:
                result_list.append(merged)
        
        # 개별 명사도 의미가 있으므로 추가 (LTV 등 단일어 보존)
        if len(sequence) > 1:
            result_list.extend([s for s in sequence if len(s) > 1])
        elif len(sequence) == 1:
            result_list.append(sequence[0])
