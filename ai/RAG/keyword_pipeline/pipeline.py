import math
import collections
import os
import json
from .chunker import ArticleChunker
from .candidate_extractor import CandidateExtractor
from .relevance_filter import RelevanceFilter
from .config import ORIGINAL_FILE_PATH, TOP_K, SIMILARITY_THRESHOLD, PROTECTED_TERMS
class KeywordExtractionPipeline:
    """
    Hybrid ranking pipeline (TF, DF-Penalty, Title-Bonus, Embedding)
    """
    def __init__(self, content=None):
        if content is not None:
            self.chunker = ArticleChunker(content=content)
        else:
            self.chunker = ArticleChunker(file_path=ORIGINAL_FILE_PATH)
        self.extractor = CandidateExtractor()
        self.validator = RelevanceFilter()
        self.protected_terms = set(PROTECTED_TERMS)
        concept_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "data", "concept_dict.json")
        try:
            with open(concept_path, "r", encoding="utf-8") as f:
                self.concept_dict = json.load(f)
        except Exception as e:
            print(f"Warning: concept_dict.json 로드 실패 - {e}")
            self.concept_dict = {}
    def run(self):
        chunks = self.chunker.run()
        global_term_counts = collections.defaultdict(int)
        chunk_candidates = []
        print(f"--- 분석 중: 총 {len(chunks)}개 청크 발견 ---")
        for chunk in chunks:
            candidates = self.extractor.run(chunk["text"])
            unique_terms = set(candidates)
            for term in unique_terms:
                global_term_counts[term] += 1
            chunk_candidates.append(candidates)
        results = []
        num_chunks = len(chunks)
        for i, chunk in enumerate(chunks):
            candidates = chunk_candidates[i]
            if not candidates:
                results.append(self._empty_result(chunk))
                continue
            rf_counts = collections.Counter(candidates)
            scored_keywords = []
            chunk_text = chunk["text"]
            chunk_title = chunk["title"]
            unique_candidates = sorted(rf_counts.items(), key=lambda x: x[1], reverse=True)
            validated = self.validator.validate(
                chunk_text, 
                unique_candidates, 
                threshold=SIMILARITY_THRESHOLD, 
                top_k=len(unique_candidates)
            )
            relevance_map = {item["word"]: item["relevance"] for item in validated}
            for word, count in unique_candidates:
                score_rf = count
                df = global_term_counts[word]
                penalty_df = math.log(num_chunks / df) if df > 0 else 0
                title_bonus = 3.0 if word in chunk_title else 1.0
                domain_bonus = 2.5 if word in self.protected_terms else 1.0
                structure_bonus = 1.2 if any(sym in chunk_text for sym in ["-", "=", "LTV", "DSR"]) else 1.0
                relevance = relevance_map.get(word, 0.0)
                final_score = (score_rf * penalty_df * title_bonus * domain_bonus * structure_bonus) + (relevance * 5)
                scored_keywords.append({
                    "word": word,
                    "final_score": round(final_score, 2),
                    "rf": count,
                    "df": df,
                    "relevance": round(relevance, 4)
                })
            scored_keywords.sort(key=lambda x: x["final_score"], reverse=True)
            top_selection = scored_keywords[:TOP_K]
            import re
            clean_title = re.sub(r'^#+\s*', '', chunk["title"]).strip()
            final_kws = [clean_title] + [item["word"] for item in top_selection]
            matched_concepts = set()
            clean_chunk_text = chunk_text.replace(" ", "")
            clean_title_no_space = clean_title.replace(" ", "")
            for concept_key, concept_data in self.concept_dict.items():
                all_terms = [concept_key] + concept_data.get("synonyms", []) + concept_data.get("values", [])
                for term in all_terms:
                    clean_term = term.replace(" ", "")
                    if clean_term in clean_chunk_text or clean_term in clean_title_no_space:
                        matched_concepts.add(concept_key)
                        break
                if concept_key not in matched_concepts:
                    for kw in final_kws:
                        for term in all_terms:
                            if kw in term or term in kw:
                                matched_concepts.add(concept_key)
                                break
                        if concept_key in matched_concepts:
                            break
            results.append({
                "chunk_id": chunk["chunk_id"],
                "article_id": chunk["article_id"],
                "title": chunk["title"],
                "original_text": chunk_text,
                "final_keywords": final_kws,
                "concepts": list(matched_concepts)
            })
        return results
    def _empty_result(self, chunk):
        return {
            "chunk_id": chunk["chunk_id"],
            "article_id": chunk["article_id"],
            "title": chunk["title"],
            "original_text": chunk["text"],
            "final_keywords": [],
            "concepts": []
        }
