import numpy as np
from sentence_transformers import SentenceTransformer

class BaseEmbeddingModel:
    """
    임베딩 모델 추상화를 위한 베이스 클래스
    """
    def embed_text(self, text):
        raise NotImplementedError("embed_text method must be implemented.")

class BGEM3EmbeddingModel(BaseEmbeddingModel):
    """
    BGE-M3 모델 (HuggingFace sentence-transformers 기반) 로컬 로딩
    """
    def __init__(self):
        self.model = SentenceTransformer("BAAI/bge-m3", device="cpu")

    def embed_text(self, text):
        return self.model.encode(text)

class RelevanceFilter:
    """
    임베딩 기반 의미론적 유사도를 계산하여 키워드를 필터링하는 클래스
    """
    def __init__(self, model: BaseEmbeddingModel = None):
        # 기본적으로 BGE-M3 모델 사용
        self.model = model or BGEM3EmbeddingModel()

    def validate(self, chunk_text, candidates, threshold=0.1, top_k=10):
        """
        청크 텍스트와 키워드 간의 유사도 검증
        """
        if not candidates:
            return []
            
        chunk_vector = self.model.embed_text(chunk_text)
        
        words = [item[0] for item in candidates]
        counts = [item[1] for item in candidates]
        words_vectors = self.model.embed_text(words)
        
        validated_keywords = []
        
        chunk_norm = np.linalg.norm(chunk_vector)
        if chunk_norm == 0:
            return []

        for i, word in enumerate(words):
            word_vector = words_vectors[i]
            word_norm = np.linalg.norm(word_vector)
            
            if word_norm == 0:
                continue
            
            similarity = np.dot(chunk_vector, word_vector) / (chunk_norm * word_norm)
            
            if similarity >= threshold:
                validated_keywords.append({
                    "word": word,
                    "count": counts[i],
                    "relevance": float(similarity)
                })
        
        validated_keywords.sort(key=lambda x: x["relevance"], reverse=True)
        return validated_keywords[:top_k]
