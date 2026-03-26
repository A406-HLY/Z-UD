from pydantic import BaseModel, Field
from typing import Dict, Any, List, Optional

class SearchRequest(BaseModel):
    user_data: Dict[str, Any]

class FieldSearchResponse(BaseModel):
    name_ko: str = Field(alias='name_ko', default='')
    value: Any = None
    search_query: str = Field(alias='search_query', default='')
    matched_articles: List[str] = Field(alias='matched_articles', default_factory=list)

class SearchResponse(BaseModel):
    consultationId: Optional[str] = None
    result: Dict[str, Dict[str, Any]]

class UpdateRequest(BaseModel):
    content: Optional[str] = None

class UpdateResponse(BaseModel):
    status: str
    message: str
    total_chunks: int
