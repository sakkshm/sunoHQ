from server.handlers.db_handler import prisma
from server.models.models import BusinessCreate, BusinessUpdate
from typing import Optional, List
import json

class BusinessCRUD:
    
    @staticmethod
    async def create_business(business: BusinessCreate) -> dict:
        """Create a new business"""
        
        # Convert operating_hours to JSON if provided
        operating_hours_json = None
        if business.operating_hours:
            operating_hours_json = business.operating_hours.model_dump()
        
        result = await prisma.business.create(
            data={
                "userId": business.user_id,
                "botToken": business.bot_token,
                "businessName": business.business_name,
                "category": business.category,
                "description": business.description,
                "language": business.language,
                "voiceSpeaker": business.voice_speaker,
                "botPersona": business.bot_persona,
                "operatingHours": json.dumps(operating_hours_json) if operating_hours_json else None,
                "location": business.location,
                "phone": business.phone,
                "email": business.email,
            }
        )
        return result
    
    @staticmethod
    async def get_business_by_id(business_id: str) -> Optional[dict]:
        """Get business by ID"""
        return await prisma.business.find_unique(
            where={"id": business_id}
        )
    
    @staticmethod
    async def get_business_by_uuid(bot_uuid: str) -> Optional[dict]:
        """Get business by bot UUID"""
        return await prisma.business.find_unique(
            where={"botUuid": bot_uuid}
        )
    
    @staticmethod
    async def get_business_by_token(bot_token: str) -> Optional[dict]:
        """Get business by bot token"""
        return await prisma.business.find_unique(
            where={"botToken": bot_token}
        )
    
    @staticmethod
    async def get_all_businesses(user_id: Optional[str] = None) -> List[dict]:
        """Get all businesses, optionally filtered by user"""
        if user_id:
            return await prisma.business.find_many(
                where={"userId": user_id}
            )
        return await prisma.business.find_many()
    
    @staticmethod
    async def update_business(business_id: str, update_data: BusinessUpdate) -> Optional[dict]:
        """Update business"""
        
        # Filter out None values
        data = {k: v for k, v in update_data.model_dump().items() if v is not None}
        
        # Convert operating_hours to JSON string if present
        if 'operating_hours' in data:
            data['operatingHours'] = json.dumps(data.pop('operating_hours'))
        
        # Convert snake_case to camelCase for Prisma
        prisma_data = {}
        field_mapping = {
            'business_name': 'businessName',
            'voice_speaker': 'voiceSpeaker',
            'bot_persona': 'botPersona',
        }
        
        for key, value in data.items():
            prisma_key = field_mapping.get(key, key)
            prisma_data[prisma_key] = value
        
        return await prisma.business.update(
            where={"id": business_id},
            data=prisma_data
        )
    
    @staticmethod
    async def update_webhook(business_id: str, webhook_url: str, enabled: bool) -> Optional[dict]:
        """Update webhook configuration"""
        return await prisma.business.update(
            where={"id": business_id},
            data={
                "webhookUrl": webhook_url,
                "webhookEnabled": enabled
            }
        )
    
    @staticmethod
    async def delete_business(business_id: str) -> bool:
        """Delete business"""
        try:
            await prisma.business.delete(
                where={"id": business_id}
            )
            return True
        except:
            return False

business_crud = BusinessCRUD()
