import os
import json
import numpy as np
import torch
from sentence_transformers import SentenceTransformer

def cosine_similarity(vec1, vec2):
    return np.dot(vec1, vec2) / (np.linalg.norm(vec1) * np.linalg.norm(vec2) + 1e-9)

class HybridRetriever:
    """
    Hybrid retriever using Semantic Search (SentenceTransformer) and Ontology Soft Matching.
    """
    def __init__(self, concept_dict_path, model_name='dragonkue/bge-m3-ko', device="cpu"):
        self.device = device
        self.model = SentenceTransformer(model_name, device=self.device)
        
        with open(concept_dict_path, "r", encoding="utf-8") as f:
            self.concept_dict = json.load(f)
            
    def encode_documents(self, documents):
        """
        문서 리스트를 입력받아 벡터 임베딩을 수행합니다.
        documents: [{'title': str, 'text': str, 'concepts': list}, ...]
        """
        texts = [doc.get("original_text", doc.get("text", "")) for doc in documents]
        return self.model.encode(texts)
        
    def retrieve(self, query_text, target_field, documents, doc_vectors, top_k=5, threshold=0.65):
        """
        주어진 쿼리에 대해 하이브리드 검색을 수행합니다.
        """
        q_vec = self.model.encode([query_text])[0]
        
        # 필드명을 Concept Key로 매핑
        mapped_concept_key = None
        for c_key, c_data in self.concept_dict.items():
            all_t = [c_key] + c_data.get("synonyms", [])
            if target_field.replace(" ", "") in [t.replace(" ", "") for t in all_t]:
                mapped_concept_key = c_key
                break
                
        # 타겟 필드의 유사어 및 값 리스트
        synonyms_list = self.concept_dict.get(target_field, {}).get("synonyms", [])
        values_list = self.concept_dict.get(target_field, {}).get("values", [])
        
        scores = []
        for i, chunk in enumerate(documents):
            # 1. 시맨틱 스코어
            max_sim = float(cosine_similarity(q_vec, doc_vectors[i]))
            
            # 2. 콘셉트 보너스 (문서 청크에 타겟 콘셉트가 추출되어 있다면)
            concept_bonus = 0.0
            if "concepts" in chunk and mapped_concept_key and mapped_concept_key in chunk["concepts"]:
                concept_bonus = 0.35
                
            # 3. 타이틀 보너스 (조항 타이틀에 힌트가 있다면)
            title_bonus = 0.0
            title_clean = chunk["title"].replace(" ", "")
            match_terms_title = [target_field] + synonyms_list + values_list
            if mapped_concept_key:
                match_terms_title.append(mapped_concept_key)
                
            if any(str(t).replace(" ", "") in title_clean for t in match_terms_title if t):
                title_bonus = 0.15
                
            # 4. 바디 보너스 (본문 내에 주요 힌트 단어가 포함되었다면)
            body_bonus = 0.0
            match_terms_body = [target_field] + synonyms_list + values_list
            for term in match_terms_body:
                chunk_body = chunk.get("original_text", chunk.get("text", ""))
                if term and str(term).replace(" ", "") in chunk_body.replace(" ", ""):
                    body_bonus = 0.20
                    break
                    
            # 점수 합산
            final_score = max_sim + concept_bonus + title_bonus + body_bonus
            scores.append((final_score, chunk))
            
        # 내림차순 정렬
        scores.sort(key=lambda x: x[0], reverse=True)
        
        # 5. Rank Penalty (Disable for optimal Exact Match)
        penalized_scores = [(s, chunk) for i, (s, chunk) in enumerate(scores)]
        
        # Threshold 적용
        results = []
        for s, chunk in penalized_scores:
            if s >= threshold:
                results.append({"score": s, "chunk": chunk})
                
        return results

if __name__ == "__main__":
    pass