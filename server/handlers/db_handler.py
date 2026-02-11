from prisma import Prisma
from contextlib import asynccontextmanager

prisma = Prisma()

async def connect_db():
    """Connect to database"""
    await prisma.connect()
    print("Database connected")

async def disconnect_db():
    """Disconnect from database"""
    await prisma.disconnect()
    print("Database disconnected")

@asynccontextmanager
async def get_db():
    """Database session context manager"""
    try:
        yield prisma
    finally:
        pass
