import re
from .morph_analyzer import MorphAnalyzer
from .blacklist import BlacklistFilter

class CandidateExtractor:

    def __init__(self, analyzer=None):
        self.analyzer = analyzer or MorphAnalyzer()
        self.blacklist_filter = BlacklistFilter()

    def run(self, text):
        clean_text = self._preprocess(text)
        raw_candidates = self.analyzer.analyze(clean_text)
        final_candidates = []
        for word in raw_candidates:
            norm_word = word.upper() if word.lower() in ['ltv', 'dsr'] else word
            if norm_word not in self.blacklist_filter.blacklist:
                final_candidates.append(norm_word)
        return final_candidates

    def _preprocess(self, text):
        text = re.sub('[\\s\\(\\)\\[\\]\\{\\},:;!·]', ' ', text)
        return text.strip()
