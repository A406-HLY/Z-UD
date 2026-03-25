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
        
        # Load Concept Dictionary
        concept_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "data", "concept_dict.json")
        try:
            with open(concept_path, "r", encoding="utf-8") as f:
                self.concept_dict = json.load(f)
        except Exception as e:
            print(f"Warning: concept_dict.json 로드 실패 - {e}")
            self.concept_dict = {}

    def run(self):
        # 1. Chunking
        chunks = self.chunker.run()
        
        # 2. Global DF (Document Frequency) calculation
        global_term_counts = collections.defaultdict(int)
        chunk_candidates = []
        
        print(f"--- 분석 중: 총 {len(chunks)}개 청크 발견 ---")
        
        for chunk in chunks:
            candidates = self.extractor.run(chunk["text"])
            
            # 중복 제거된 단어 집합으로 DF 계산
            unique_terms = set(candidates)
            for term in unique_terms:
                global_term_counts[term] += 1
            
            chunk_candidates.append(candidates)

        # 3. Hybrid ranking and extraction
        results = []
        num_chunks = len(chunks)

        for i, chunk in enumerate(chunks):
            candidates = chunk_candidates[i]
            if not candidates:
                results.append(self._empty_result(chunk))
                continue
                
            # 빈도수 계산 (RF: Relative Frequency in chunk)
            rf_counts = collections.Counter(candidates)
            
            scored_keywords = []
            chunk_text = chunk["text"]
            chunk_title = chunk["title"]
            
            # 임베딩 필터용 후보 준비
            unique_candidates = sorted(rf_counts.items(), key=lambda x: x[1], reverse=True)
            
            # 임베딩 유사도 선행 계산 (필터링 용도)
            # (word, count, relevance) 리스트 반환
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
                
                # (3) 제목 가점: 제목에 포함된 단어 2배 가점
                title_bonus = 3.0 if word in chunk_title else 1.0
                
                # (4) 도메인 보호 용어 가점
                domain_bonus = 2.5 if word in self.protected_terms else 1.0
                
                # (5) 구조 가점: 불렛 포인트(-)나 수식(=) 근처에 있는지 체크 (간이 로직)
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

            # 최종 점수순 정렬 및 상위 K개 선택
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
                
                # 1. 텍스트 본문 직접 매칭 (가장 확실한 개념 포함 여부)
                for term in all_terms:
                    clean_term = term.replace(" ", "")
                    if clean_term in clean_chunk_text or clean_term in clean_title_no_space:
                        matched_concepts.add(concept_key)
                        break
                        
                # 2. 추출된 키워드와의 상호 포함(부분 일치) 매칭
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
