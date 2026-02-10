from fastapi import FastAPI
from server.api.routes import router

app = FastAPI(
    title="SunoHQ API",
    version="0.1",
)

app.include_router(router)

@app.get("/")
def root():
    return {"status": "ok"}

@app.get("/health")
def health():
    return {"status": "healthy"}
