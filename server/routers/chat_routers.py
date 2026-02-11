from fastapi import APIRouter, HTTPException, status
from server.core.conversation import conversation_service
from typing import List

chat_router = APIRouter(prefix="/api/chats", tags=["chats"])

@chat_router.get("/{business_id}")
async def get_business_chats(business_id: str):
    """Get all conversations for a business"""
    try:
        conversations = await conversation_service.get_conversations_by_business(business_id)
        return conversations
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching chats: {str(e)}"
        )
