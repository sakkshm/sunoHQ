import os
import httpx
from typing import Optional

class TelegramBot:
    def __init__(self, bot_token: str):
        self.bot_token = bot_token
        self.base_url = f"https://api.telegram.org/bot{bot_token}"
        self.file_base_url = f"https://api.telegram.org/file/bot{bot_token}"  # <- Important!

    async def get_bot_info(self) -> Optional[dict]:
        """Get bot information"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(f"{self.base_url}/getMe")
                data = response.json()
                if data.get("ok"):
                    return data.get("result")
                return None
        except Exception as e:
            print(f"Error getting bot info: {e}")
            return None
    
    async def set_webhook(self, webhook_url: str) -> bool:
        """Set webhook for bot"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/setWebhook",
                    json={"url": webhook_url}
                )
                data = response.json()
                return data.get("ok", False)
        except Exception as e:
            print(f"Error setting webhook: {e}")
            return False
    
    async def delete_webhook(self) -> bool:
        """Delete webhook"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(f"{self.base_url}/deleteWebhook")
                data = response.json()
                return data.get("ok", False)
        except Exception as e:
            print(f"Error deleting webhook: {e}")
            return False
    
    async def get_webhook_info(self) -> Optional[dict]:
        """Get current webhook info"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(f"{self.base_url}/getWebhookInfo")
                data = response.json()
                if data.get("ok"):
                    return data.get("result")
                return None
        except Exception as e:
            print(f"Error getting webhook info: {e}")
            return None
    
    async def send_message(self, chat_id: int, text: str) -> bool:
        """Send text message to chat"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/sendMessage",
                    json={
                        "chat_id": chat_id,
                        "text": text,
                        "parse_mode": "Markdown"
                    }
                )
                data = response.json()
                return data.get("ok", False)
        except Exception as e:
            print(f"Error sending message: {e}")
            return False
    
    async def send_chat_action(self, chat_id: int, action: str = "typing") -> bool:
        """Send chat action (typing indicator)"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/sendChatAction",
                    json={
                        "chat_id": chat_id,
                        "action": action
                    }
                )
                data = response.json()
                return data.get("ok", False)
        except Exception as e:
            return False

    async def send_voice(self, chat_id: int, file_path: str, caption: Optional[str] = None) -> bool:
        """
        Send a voice message (.ogg/.mp3) to a Telegram chat
        """
        if not os.path.exists(file_path):
            print(f"Voice file not found: {file_path}")
            return False

        try:
            async with httpx.AsyncClient() as client:
                with open(file_path, "rb") as f:
                    files = {"voice": f}
                    data = {"chat_id": chat_id}
                    if caption:
                        data["caption"] = caption

                    response = await client.post(f"{self.base_url}/sendVoice", data=data, files=files)
                    result = response.json()
                    if not result.get("ok", False):
                        print(f"Failed to send voice: {result}")
                    return result.get("ok", False)
        except Exception as e:
            print(f"Error sending voice message: {e}")
            return False
        
    async def download_file(self, file_id: str, destination_path: str) -> bool:
        """
        Download a file (voice/photo/document) from Telegram servers using file_id
        """
        try:
            async with httpx.AsyncClient() as client:
                # Step 1: Get file path from Telegram API
                resp = await client.get(f"{self.base_url}/getFile", params={"file_id": file_id})
                resp_data = resp.json()

                if not resp_data.get("ok"):
                    print(f"Failed to get file info: {resp_data}")
                    return False

                file_path = resp_data["result"]["file_path"]

                # Step 2: Download the actual file
                file_url = f"{self.file_base_url}/{file_path}"  # use file_base_url here
                file_resp = await client.get(file_url)

                if file_resp.status_code != 200:
                    print(f"Failed to download file, status: {file_resp.status_code}")
                    return False

                # Ensure directory exists
                os.makedirs(os.path.dirname(destination_path), exist_ok=True)

                # Save to destination path
                with open(destination_path, "wb") as f:
                    f.write(file_resp.content)

                print(f"File downloaded to: {destination_path}")
                return True

        except Exception as e:
            print(f"Error downloading file: {e}")
            return False