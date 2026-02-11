from server.handlers.db_handler import prisma
from prisma import Json
from typing import List, Dict, Optional
from datetime import datetime

class ConversationService:
    
    # In-memory message cache (conversation_id -> list of messages)
    # TODO: Replace with Redis or other persistent store for production
    _message_cache: Dict[str, List[Dict]] = {}
    
    @staticmethod
    async def get_conversations_by_business(business_id: str) -> List[dict]:
        """Get all conversations for a business"""
        return await prisma.conversation.find_many(
            where={"businessId": business_id},
            order={"lastActivity": "desc"}
        )

    @staticmethod
    async def get_or_create_conversation(business_id: str, customer_id: str, customer_name: str) -> dict:
        """Get existing conversation or create new one"""
        
        conversation = await prisma.conversation.find_first(
            where={
                "businessId": business_id,
                "customerId": customer_id
            },
            order={
                "lastActivity": "desc"
            }
        )
        
        if conversation:
            # Update last activity
            await prisma.conversation.update(
                where={"id": conversation.id},
                data={"lastActivity": datetime.now()}
            )
            return conversation
        
        return await prisma.conversation.create(
            data={
                "businessId": business_id,
                "customerId": customer_id,
                "customerName": customer_name,
                "lastActivity": datetime.now()
            }
        )
    
    @staticmethod
    async def add_message(conversation_id: str, role: str, content: str):
        """Add message to in-memory cache AND persist to database"""
        
        message = {
            "role": role,
            "content": content,
            "timestamp": datetime.now().isoformat()
        }
        
        # Store in memory cache
        if conversation_id not in ConversationService._message_cache:
            ConversationService._message_cache[conversation_id] = []
        
        ConversationService._message_cache[conversation_id].append(message)
        
        # Keep only last 50 messages per conversation in memory
        if len(ConversationService._message_cache[conversation_id]) > 50:
            ConversationService._message_cache[conversation_id] = \
                ConversationService._message_cache[conversation_id][-50:]
        
        # Persist message to database (read-append-write for Json[] field)
        conversation = await prisma.conversation.find_unique(
            where={"id": conversation_id}
        )
        existing_messages = list(conversation.messages) if conversation and conversation.messages else []
        existing_messages.append(message)
        
        # Prisma Python requires each Json[] element wrapped in Json()
        await prisma.conversation.update(
            where={"id": conversation_id},
            data={
                "lastActivity": datetime.now(),
                "messages": [Json(m) for m in existing_messages]
            }
        )
        
        return True
    
    @staticmethod
    async def get_recent_messages(conversation_id: str, limit: int = 5) -> List[Dict]:
        """Get last N messages — from cache if available, otherwise from DB"""
        
        messages = ConversationService._message_cache.get(conversation_id, [])
        
        # If cache is empty (e.g. after server restart), load from DB
        if not messages:
            conversation = await prisma.conversation.find_unique(
                where={"id": conversation_id}
            )
            if conversation and conversation.messages:
                # conversation.messages is a list of Json objects
                messages = [
                    {"role": m.get("role", "user"), "content": m.get("content", ""), "timestamp": m.get("timestamp", "")}
                    for m in conversation.messages
                    if isinstance(m, dict)
                ]
                # Populate cache for future calls
                ConversationService._message_cache[conversation_id] = messages
        
        # Return last N messages
        recent = messages[-limit:] if len(messages) > limit else messages
        
        # Ensure first message is from 'user' (Sarvam LLM requirement)
        while recent and recent[0]["role"] != "user":
            recent = recent[1:]
        
        # Format for LLM (remove timestamp)
        return [{"role": msg["role"], "content": msg["content"]} for msg in recent]

conversation_service = ConversationService()
