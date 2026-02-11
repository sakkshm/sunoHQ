import base64
import json
import os
import dotenv
from sarvamai import SarvamAI
from typing import List, Dict, Optional

dotenv.load_dotenv()

class SarvamLLMService:
    def __init__(self):
        self.api_key = os.getenv("SARVAM_API_KEY")

        self.client = SarvamAI(
            api_subscription_key=self.api_key
        )

    async def chat_completion(
        self,
        messages: List[Dict[str, str]],
        temperature: float = 0.7,
        max_tokens: int = 500
    ) -> Optional[str]:
        """
        Get chat completion from Sarvam AI
        """
        try:
            response = self.client.chat.completions(
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens,
                stream=False,
                n=1,
            )

            return response.choices[0].message.content

        except Exception as e:
            print(f"Sarvam LLM Exception: {str(e)}")
            return None


    def build_system_prompt(self, business: dict) -> str:
        """Build system prompt from business details"""

        operating_hours = business.operatingHours

        if isinstance(operating_hours, str):
            try:
                operating_hours = json.loads(operating_hours)
            except Exception:
                operating_hours = {"weekday": "09:00-21:00", "weekend": "10:00-18:00"}

        weekday = operating_hours.get("weekday", "09:00-21:00")
        weekend = operating_hours.get("weekend", "10:00-18:00")

        prompt = f"""You are a customer service assistant for {business.businessName}, a {business.category or 'business'}.

Business Information:
- Name: {business.businessName}
- Category: {business.category or 'General'}
- Location: {business.location or 'Not specified'}
- Phone: {business.phone or 'Not specified'}

Description: {business.description or 'A friendly business serving customers.'}

Operating Hours:
- Weekdays (Mon-Fri): {weekday}
- Weekends (Sat-Sun): {weekend}

Your Role:
You are a {business.botPersona or 'friendly and helpful customer service agent'}.

Instructions:
1. Answer customer questions clearly and concisely in 2-3 sentences
2. Use the same language as the customer (Hindi, English, or mix)
3. Be warm, professional, and helpful
4. If asked about hours, menu, location, use the information above
5. For appointments or orders, acknowledge and say you're noting it down
6. If you don't know something, politely say you'll have someone call them back

Current Time: Check if business is currently open based on operating hours.

Remember: Keep responses SHORT and NATURAL for voice conversation."""
        return prompt

class SarvamSTTService:
    def __init__(self):
        self.api_key = os.getenv("SARVAM_API_KEY")

        if not self.api_key:
            raise ValueError("SARVAM_API_KEY not found in environment")

        self.client = SarvamAI(
            api_subscription_key=self.api_key
        )

    def transcribe(self, file_path: str) -> Optional[str]:
        """
        Transcribe audio file using Sarvam Speech-to-Text API
        Supports Telegram .ogg (opus) files
        """
        try:
            with open(file_path, "rb") as audio_file:
                response = self.client.speech_to_text.transcribe(
                    file=audio_file,
                    model="saarika:v2.5",
                    language_code="unknown",  # auto-detect
                )

            return response.transcript

        except Exception as e:
            print(f"Sarvam STT Exception: {str(e)}")
            return None

class SarvamTTSService:
    def __init__(self):
        self.api_key = os.getenv("SARVAM_API_KEY")
        if not self.api_key:
            raise ValueError("SARVAM_API_KEY not found in environment")

        # Initialize SarvamAI client
        self.client = SarvamAI(api_subscription_key=self.api_key)

    def synthesize(
        self,
        text: str,
        output_path: str,
        model: str = "bulbul:v3",
        speaker: Optional[str] = "shubh",
        pace: float = 1.0,
        temperature: float = 0.6,
        speech_sample_rate: int = 24000
    ) -> bool:
        """
        Convert text into spoken audio and save to output_path (OGG/WAV)
        """

        if len(text) == 0:
            print("No text provided for TTS")
            return False

        try:
            response = self.client.text_to_speech.convert(
                text=text,
                model=model,
                speaker=speaker,
                pace=pace,
                temperature=temperature,
                target_language_code="en-IN",
                speech_sample_rate=speech_sample_rate
            )

            # response['audios'] contains base64-encoded audio(s)
            if not response.audios or len(response.audios) == 0:
                print("TTS API returned no audio")
                return False

            audio_base64 = response.audios[0]
            audio_bytes = base64.b64decode(audio_base64)

            # Write to file
            with open(output_path, "wb") as f:
                f.write(audio_bytes)

            print(f"TTS audio saved to {output_path}")
            return True

        except Exception as e:
            print(f"Sarvam TTS Exception: {str(e)}")
            return False

sarvam_llm_service = SarvamLLMService()
sarvam_stt_service = SarvamSTTService()
sarvam_tts_service = SarvamTTSService()