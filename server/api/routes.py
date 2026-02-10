import uuid
from typing import List
from pydantic import BaseModel
from fastapi import APIRouter

from server.core.rag import search_documents, insert_documents

class ItemCreate(BaseModel):
    business_id: str
    text: str


class ItemSearch(BaseModel):
    query: str
    business_id: str


router = APIRouter(prefix="/api")

@router.post("/add_documents")
def add_documents_handler(items: List[ItemCreate]):
    documents = []

    for item in items:
        new_item = {
            "id": str(uuid.uuid4()),
            "business_id": item.business_id,
            "text": item.text,
        }
        documents.append(new_item)

    return insert_documents(documents)

@router.post("/search_query")
def search_documents_handler(query: ItemSearch):

    return search_documents(
        query=query.query,
        business_id=query.business_id,
    )