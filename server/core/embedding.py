from typing import List
from google import genai
from google.genai import types
import os
import dotenv

dotenv.load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

EMBEDDING_MODEL = "gemini-embedding-001"
OUTPUT_DIMENSIONS = 768

def embed_text(
    text: List[str],
    task_type: str = "retrieval_document",
):
    """
    task_type:
      - retrieval_document (for docs)
      - retrieval_query (for queries)
    """

    response = client.models.embed_content(
        model=EMBEDDING_MODEL,
        contents=text,
        config=types.EmbedContentConfig(task_type=task_type, output_dimensionality=768)
    )

    # Gemini returns a list of embeddings
    return [e.values for e in response.embeddings]
