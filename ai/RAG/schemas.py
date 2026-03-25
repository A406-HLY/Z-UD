from pydantic import BaseModel, Field
from typing import Dict, Any, List, Optional

class SearchRequest(BaseModel):
    """
    유저가 입력한 대출 심사 데이터 딕셔너리
    예:
    {
      "user_data": {
        "신용등급": "A",
        "보유주택수": 0
      }
    }
    """
    user_data: Dict[str, Any]

class FieldSearchResponse(BaseModel):
    name_ko: str = Field(alias="name_ko", default="")
    value: Any = None
    search_query: str = Field(alias="search_query", default="")
    matched_articles: List[str] = Field(alias="matched_articles", default_factory=list)

class SearchResponse(BaseModel):
    consultationId: Optional[str] = None
    result: Dict[str, Dict[str, FieldSearchResponse]]

class UpdateRequest(BaseModel):
    """
    외부 Storage에서 텍스트를 읽어와 DB를 갱신할 때 사용.
    content가 주어지지 않으면 로컬의 Original_Loan_Rules.txt를 사용합니다.
    """
    content: Optional[str] = None

class UpdateResponse(BaseModel):
    status: str
    message: str
    total_chunks: int
