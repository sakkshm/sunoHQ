import os
from fastapi import APIRouter, HTTPException, status
from server.models.models import BusinessCreate, BusinessUpdate, BusinessResponse, WebhookUpdate
from server.handlers.business_handlers import business_crud
from server.utils.telegram_utils import TelegramBot

from typing import List

business_router = APIRouter(prefix="/api/business")

@business_router.post("/", response_model=BusinessResponse, status_code=status.HTTP_201_CREATED)
async def create_business(business: BusinessCreate):
    """Create a new business and register bot"""
    
    # Check if bot token already exists
    existing = await business_crud.get_business_by_token(business.bot_token)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Bot token already registered"
        )
    
    # Verify bot token with Telegram
    telegram_bot = TelegramBot(business.bot_token)
    bot_info = await telegram_bot.get_bot_info()
    
    if not bot_info:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid bot token. Please check your token from @BotFather"
        )
    
    # Create business
    try:
        result = await business_crud.create_business(business)
        
        # Setup webhook
        webhook_url = f"{os.getenv("BASE_URL")}/api/telegram/webhook/{result.botUuid}"
        webhook_set = await telegram_bot.set_webhook(webhook_url)
        
        if webhook_set:
            await business_crud.update_webhook(result.id, webhook_url, True)
        
        return result
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating business: {str(e)}"
        )

@business_router.get("/", response_model=List[BusinessResponse])
async def get_all_businesses(user_id: str = None):
    """Get all businesses, optionally filtered by user"""
    return await business_crud.get_all_businesses(user_id)


@business_router.get("/{business_id}", response_model=BusinessResponse)
async def get_business(business_id: str):
    """Get business by ID"""
    business = await business_crud.get_business_by_id(business_id)
    
    if not business:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Business not found"
        )
    
    return business


@business_router.put("/{business_id}", response_model=BusinessResponse)
async def update_business(business_id: str, update_data: BusinessUpdate):
    """Update business"""
    business = await business_crud.get_business_by_id(business_id)
    
    if not business:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Business not found"
        )
    
    updated = await business_crud.update_business(business_id, update_data)
    return updated

@business_router.post("/{business_id}/webhook", response_model=BusinessResponse)
async def toggle_webhook(business_id: str, webhook_update: WebhookUpdate):
    """Enable or disable webhook"""
    business = await business_crud.get_business_by_id(business_id)
    
    if not business:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Business not found"
        )
    
    telegram_bot = TelegramBot(business.botToken)
    
    if webhook_update.enabled:
        webhook_url = f"{os.getenv("BASE_URL")}/api/telegram/webhook/{business.botUuid}"
        success = await telegram_bot.set_webhook(webhook_url)
        if success:
            updated = await business_crud.update_webhook(business.id, webhook_url, True)
            return updated
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to set webhook"
            )
    else:
        success = await telegram_bot.delete_webhook()
        if success:
            updated = await business_crud.update_webhook(business.id, None, False)
            return updated
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to delete webhook"
            )

@business_router.delete("/{business_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_business(business_id: str):
    """Delete business"""
    business = await business_crud.get_business_by_id(business_id)
    
    if not business:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Business not found"
        )
    
    # Delete webhook first
    telegram_bot = TelegramBot(business.botToken)
    await telegram_bot.delete_webhook()
    
    # Delete business
    success = await business_crud.delete_business(business_id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete business"
        )
    
    return None
