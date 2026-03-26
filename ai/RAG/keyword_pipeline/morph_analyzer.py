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
        protected_found = []
        temp_text = text
        for term in sorted(self.protected_terms, key=len, reverse=True):
            pattern = r'\s*'.join([re.escape(char) for char in term])
            matches = re.findall(pattern, temp_text)
            if matches:
                protected_found.extend([term] * len(matches))
                temp_text = re.sub(pattern, " " * len(term), temp_text)
        nouns = []
        tokens = self.kiwi.tokenize(temp_text)
        current_sequence = []
        for token in tokens:
            surface = token.form
            feature = token.tag
            is_valid_pos = False
            if feature in ["NNG", "NNP", "SL"]:
                is_valid_pos = True
            if is_valid_pos and len(surface) > 0:
                clean_surface = re.sub(r'[^가-힣A-Za-z0-9]', '', surface)
                if clean_surface:
                    current_sequence.append(clean_surface)
            else:
                if current_sequence:
                    self._process_sequence(current_sequence, nouns)
                    current_sequence = []
        if current_sequence:
            self._process_sequence(current_sequence, nouns)
        final_nouns = nouns + protected_found
        return [n for n in final_nouns if 1 < len(n) <= MAX_COMPOUND_LEN]
    def _process_sequence(self, sequence, result_list):
        """
        명사 시퀀스를 병합 규칙에 따라 처리
        """
        if len(sequence) <= MAX_COMPOUND_WORDS:
            merged = "".join(sequence)
            if len(merged) <= MAX_COMPOUND_LEN:
                result_list.append(merged)
        if len(sequence) > 1:
            result_list.extend([s for s in sequence if len(s) > 1])
        elif len(sequence) == 1:
            result_list.append(sequence[0])
