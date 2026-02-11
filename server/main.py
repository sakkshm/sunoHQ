import os
import dotenv

dotenv.load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from server.routers.qdrant_routers import qdrant_router
from server.routers.business_routers import business_router
from server.routers.telegram_routers import telegram_router
from server.routers.chat_routers import chat_router
from server.utils.utils import reregister_webhooks
from server.handlers.db_handler import connect_db, disconnect_db

app = FastAPI(
    title="SunoHQ API",
    description="No-code voice agent platform for Indian businesses",
    version="0.1",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup():
    await connect_db()
    # Re-register all active webhooks with the current BASE_URL
    await reregister_webhooks()

@app.on_event("shutdown")
async def shutdown():
    await disconnect_db()

app.include_router(qdrant_router)
app.include_router(business_router)
app.include_router(telegram_router)
app.include_router(chat_router)

@app.get("/")
def root():
    return {"status": "ok"}

@app.get("/health")
def health():
    return {"status": "healthy"}
