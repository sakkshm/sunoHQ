import os
from server.handlers.db_handler import prisma
from server.utils.telegram_utils import TelegramBot

async def reregister_webhooks():
    """Re-register all active webhooks with the current BASE_URL on startup."""
    
    base_url = os.getenv("BASE_URL")
    if not base_url:
        print("BASE_URL not set — skipping webhook re-registration")
        return

    businesses = await prisma.business.find_many(
        where={"webhookEnabled": True}
    )

    for business in businesses:
        new_webhook_url = f"{base_url}/api/telegram/webhook/{business.botUuid}"

        # Skip if webhook URL is already correct
        if business.webhookUrl == new_webhook_url:
            print(f"Webhook already correct for {business.businessName}")
            continue

        telegram_bot = TelegramBot(business.botToken)
        success = await telegram_bot.set_webhook(new_webhook_url)

        if success:
            await prisma.business.update(
                where={"id": business.id},
                data={"webhookUrl": new_webhook_url}
            )
            print(f"Webhook updated for {business.businessName}: {new_webhook_url}")
        else:
            print(f"Failed to update webhook for {business.businessName}")