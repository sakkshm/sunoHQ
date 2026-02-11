import uuid
from typing import List
from fastapi import APIRouter

from server.models.models import ItemCreate, ItemSearch
from server.core.rag import search_documents, insert_documents, get_documents_by_business


qdrant_router = APIRouter(prefix="/api")

@qdrant_router.get("/documents/{business_id}")
def get_documents_handler(business_id: str):
    """Get all documents for a business"""
    try:
        return get_documents_by_business(business_id)
    except Exception as e:
        return []

@qdrant_router.post("/add_documents")
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

@qdrant_router.post("/search_query")
def search_documents_handler(query: ItemSearch):

    return search_documents(
        query=query.query,
        business_id=query.business_id,
    )