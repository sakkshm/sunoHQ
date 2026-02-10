import os
import dotenv
from typing import List

from qdrant_client import QdrantClient
from qdrant_client.models import PointStruct

from server.core.embedding import embed_text
from server.utils.qdrant_utils import clean_qdrant_response

dotenv.load_dotenv()

client = QdrantClient(
    url=os.getenv("QDRANT_URL"), 
    api_key=os.getenv("QDRANT_API_KEY"),
)

COLLECTION_NAME = "business_faqs"

def insert_documents(documents: List[dict]): 
    document_texts = [doc["text"] for doc in documents]
    vectors = embed_text(document_texts)

    if len(vectors) != len(documents):
        raise RuntimeError("Embedding count mismatch")
    
    points = []

    for i in range(len(document_texts)):
        doc = documents[i]
        points.append(
            PointStruct(
                id=doc["id"],
                vector=vectors[i],
                payload={
                    "text": doc["text"],
                    "business_id": doc["business_id"]
                },
            )
        )
    
    return client.upsert(
        collection_name=COLLECTION_NAME,
        points=points,
    )


def search_documents(query: str, business_id: str, limit: int = 3):
    query_vector = embed_text(
        [query],
        task_type="retrieval_query",
    )

    results = client.query_points(
        collection_name=COLLECTION_NAME,
        query=query_vector[0],
        limit=limit,
        query_filter={
            "must": [
                {
                    "key": "business_id",
                    "match": {"value": business_id},
                }
            ]
        },
    )

    return clean_qdrant_response(results.model_dump())
