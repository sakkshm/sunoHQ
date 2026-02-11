from fastapi import APIRouter, HTTPException, Request, status
from server.models.models import TelegramWebhookPayload
from server.handlers.business_handlers import business_crud
from server.core.rag import search_documents
from server.utils.telegram_utils import TelegramBot
from server.core.sarvam_llm import sarvam_llm_service, sarvam_stt_service, sarvam_tts_service
from server.core.conversation import conversation_service
from datetime import datetime

telegram_router = APIRouter(prefix="/api/telegram", tags=["telegram"])

@telegram_router.post("/webhook/{bot_uuid}")
async def telegram_webhook(bot_uuid: str, request: Request):

    business = await business_crud.get_business_by_uuid(bot_uuid)
    
    if not business:
        print(f"Bot not found: {bot_uuid}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bot not found"
        )
    
    if not business.webhookEnabled:
        print(f"Webhook disabled for: {business.businessName}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Webhook not enabled for this bot"
        )
    
    try:
        payload = await request.json()
        message = payload.get('message', {})
        
        if message:
            chat_id = message.get('chat', {}).get('id')
            customer_id = str(message.get('from', {}).get('id'))
            customer_name = message.get('from', {}).get('first_name', 'Unknown')
            username = message.get('from', {}).get('username', 'N/A')
            
            text = message.get('text')
            voice = message.get('voice')
            
            if voice:
                message_type = "voice"
                file_id = voice.get("file_id")
                duration = voice.get("duration", 0)

                print(f"Voice message received ({duration}s)")

                telegram_bot = TelegramBot(business.botToken)
                await telegram_bot.send_chat_action(chat_id, "record_voice")

                ogg_input_path = f"/tmp/{file_id}.ogg"
                tts_output_path = f"/tmp/{file_id}_reply.ogg"

                try:
                    await telegram_bot.download_file(file_id, ogg_input_path)

                    user_text = sarvam_stt_service.transcribe(ogg_input_path)

                    if not user_text:
                        await telegram_bot.send_message(
                            chat_id,
                            "Sorry, I couldn't understand your voice message. Please try again."
                        )
                        return {"status": "stt_failed"}

                    print("Transcribed Text:", user_text)

                    rag_results = search_documents(
                        query=user_text,
                        business_id=str(business.id),
                        limit=3
                    )

                    rag_context = ""

                    if rag_results:
                        filtered_results = [r for r in rag_results if r["score"] > 0.65]
                        if filtered_results:
                            rag_context = "\n\n".join(
                                [f"- {doc['text']}" for doc in filtered_results]
                            )

                    print("RAG Results:", rag_results)
                    print("RAG Context:", rag_context)

                    conversation = await conversation_service.get_or_create_conversation(
                        business_id=business.id,
                        customer_id=customer_id,
                        customer_name=customer_name
                    )

                    recent_messages = await conversation_service.get_recent_messages(
                        conversation_id=conversation.id,
                        limit=5
                    )

                    system_prompt = sarvam_llm_service.build_system_prompt(business)

                    if rag_context:
                        system_prompt = f"""
{system_prompt}

Verified Business Information:
{rag_context}

Instructions:
- Use the verified information if relevant.
- Do not hallucinate details not present in the business data.
"""

                    llm_messages = [
                        {"role": "system", "content": system_prompt}
                    ]

                    llm_messages.extend(recent_messages)

                    llm_messages.append({
                        "role": "user",
                        "content": user_text
                    })

                    response_text = await sarvam_llm_service.chat_completion(
                        messages=llm_messages,
                        temperature=0.7,
                        max_tokens=300
                    )

                    if not response_text:
                        await telegram_bot.send_message(
                            chat_id,
                            "Sorry, I'm having trouble responding right now."
                        )
                        return {"status": "llm_failed"}

                    print("LLM Response:", response_text)

                    await conversation_service.add_message(
                        conversation_id=conversation.id,
                        role="user",
                        content=user_text
                    )

                    await conversation_service.add_message(
                        conversation_id=conversation.id,
                        role="assistant",
                        content=response_text
                    )

                    sarvam_tts_service.synthesize(response_text, tts_output_path)

                    await telegram_bot.send_voice(chat_id, tts_output_path)

                    return {
                        "status": "voice_success",
                        "business_id": business.id,
                        "chat_id": chat_id
                    }

                except Exception as e:
                    print("Voice processing error:", str(e))
                    await telegram_bot.send_message(
                        chat_id,
                        "Something went wrong processing your voice message."
                    )
                    return {"status": "voice_error"}

            elif text:
                message_type = "text"
                content = text
                
                telegram_bot = TelegramBot(business.botToken)
                await telegram_bot.send_chat_action(chat_id, "typing")
                
                conversation = await conversation_service.get_or_create_conversation(
                    business_id=business.id,
                    customer_id=customer_id,
                    customer_name=customer_name
                )
                
                print(f"Conversation ID: {conversation.id}")
                
                recent_messages = await conversation_service.get_recent_messages(
                    conversation_id=conversation.id,
                    limit=5
                )

                rag_results = search_documents(
                    query=content,
                    business_id=str(business.id),
                    limit=3
                )

                rag_context = ""

                if rag_results:
                    filtered_results = [r for r in rag_results if r["score"] > 0.65]
                    if filtered_results:
                        rag_context = "\n\n".join(
                            [f"- {doc['text']}" for doc in filtered_results]
                        )

                print("RAG Results:", rag_results)
                print("RAG Context:", rag_context)

                print(f"Retrieved {len(recent_messages)} previous messages")
                
                system_prompt = sarvam_llm_service.build_system_prompt(business)
                
                if rag_context:
                    system_prompt = f"""
                {system_prompt}

                Verified Business Information:
                {rag_context}

                Instructions:
                - Use the verified information if relevant.
                - Do not hallucinate details not present in the business data.
                """

                llm_messages = [
                    {"role": "system", "content": system_prompt}
                ]

                llm_messages.extend(recent_messages)

                if not recent_messages or recent_messages[-1]["role"] != "user":
                    llm_messages.append({"role": "user", "content": content})
                else:
                    llm_messages[-1] = {"role": "user", "content": content}

                print(f"Message sequence: {' → '.join([m['role'] for m in llm_messages])}")
                print(f"Calling Sarvam LLM with {len(llm_messages)} messages...")
                
                response_text = await sarvam_llm_service.chat_completion(
                    messages=llm_messages,
                    temperature=0.7,
                    max_tokens=300
                )
                
                if response_text:
                    print(f"LLM Response: {response_text[:100]}...")
                    success = await telegram_bot.send_message(chat_id, response_text)

                    await conversation_service.add_message(
                        conversation_id=conversation.id,
                        role="user",
                        content=content
                    )
                    
                    await conversation_service.add_message(
                        conversation_id=conversation.id,
                        role="assistant",
                        content=response_text
                    )
                    
                    return {
                        "status": "success",
                        "business_id": business.id,
                        "bot_uuid": bot_uuid,
                        "chat_id": chat_id,
                        "customer_id": customer_id,
                        "response_sent": success
                    }
                else:
                    await telegram_bot.send_message(
                        chat_id,
                        "Sorry, I'm having trouble right now. Please try again in a moment."
                    )
                    return {"status": "llm_error"}
            
            else:
                return {"status": "unsupported_message_type"}
        
        return {"status": "ok", "bot_uuid": bot_uuid}
    
    except Exception as e:
        print(f"\nERROR processing webhook")
        print(f"Bot UUID: {bot_uuid}")
        print(f"Business: {business.businessName if business else 'Unknown'}")
        print(f"Error: {str(e)}\n")
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing webhook: {str(e)}"
        )

@telegram_router.get("/webhook/{bot_uuid}/info")
async def get_webhook_info(bot_uuid: str):
    
    business = await business_crud.get_business_by_uuid(bot_uuid)
    
    if not business:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bot not found"
        )
    
    return {
        "bot_uuid": bot_uuid,
        "business_name": business.businessName,
        "webhook_url": business.webhookUrl,
        "webhook_enabled": business.webhookEnabled,
        "status": business.status
    }
