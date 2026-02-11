from pydantic import BaseModel, Field, validator, ConfigDict
from typing import Optional, Dict, List
from datetime import datetime

# Items model for Qdrant routes
class ItemCreate(BaseModel):
    business_id: str
    text: str


class ItemSearch(BaseModel):
    query: str
    business_id: str


# Business Models
class OperatingHours(BaseModel):
    weekday: str = "09:00-21:00"
    weekend: str = "10:00-18:00"
    closed_days: List[str] = []


class BusinessCreate(BaseModel):
    user_id: str
    bot_token: str
    
    # Business Info
    business_name: str
    category: Optional[str] = None
    description: Optional[str] = None
    
    # Bot Characteristics
    language: str = "hi-IN"
    voice_speaker: str = "shubh"
    bot_persona: Optional[str] = "friendly and helpful customer service agent"
    
    # Operating Details
    operating_hours: Optional[OperatingHours] = None
    location: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    
    @validator('bot_token')
    def validate_bot_token(cls, v):
        if not v or len(v) < 20:
            raise ValueError('Invalid bot token format')
        return v
    
    @validator('language')
    def validate_language(cls, v):
        valid_languages = [
            'hi-IN', 'ta-IN', 'te-IN', 'kn-IN', 
            'ml-IN', 'mr-IN', 'gu-IN', 'bn-IN',
            'pa-IN', 'or-IN', 'en-IN'
        ]
        if v not in valid_languages:
            raise ValueError(f'Language must be one of {valid_languages}')
        return v


class BusinessUpdate(BaseModel):
    business_name: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    language: Optional[str] = None
    voice_speaker: Optional[str] = None
    bot_persona: Optional[str] = None
    operating_hours: Optional[Dict] = None
    location: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    status: Optional[str] = None

class BusinessResponse(BaseModel):
    id: str
    botUuid: str
    botToken: str
    businessName: str
    category: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    operatingHours: Optional[Dict] = None
    voiceSpeaker: Optional[str] = None
    botPersona: Optional[str] = None
    language: str
    status: str
    webhookUrl: Optional[str] = None
    webhookEnabled: bool
    createdAt: datetime
    
    model_config = ConfigDict(
        from_attributes=True    # Supports ORM models
    )


# Telegram Webhook Models

class WebhookUpdate(BaseModel):
    enabled: bool


class TelegramWebhookPayload(BaseModel):
    """Telegram webhook payload"""
    update_id: int
    message: Optional[Dict] = None
    edited_message: Optional[Dict] = None
    channel_post: Optional[Dict] = None
    edited_channel_post: Optional[Dict] = None
