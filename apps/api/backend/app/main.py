import asyncio
from contextlib import asynccontextmanager
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api.routes import router
from .core.config import get_settings
from .services.runtime_service import runtime_service
from .database.session import get_session_factory, Base


async def tick_loop():
    """Continuously advance the headless runtime engine every 5 seconds."""
    while True:
        try:
            runtime_service.advance(1)
        except Exception as e:
            logging.error(f"Failed to advance simulation: {e}")
        await asyncio.sleep(5)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Guarantee tables are created on database startup
    factory = get_session_factory()
    if factory:
        try:
            Base.metadata.create_all(bind=factory.kw['bind'])
        except Exception as e:
            logging.error(f"Auto-migration setup failed: {e}")

    # Fire off continuous simulation thread
    task = asyncio.create_task(tick_loop())
    yield
    task.cancel()


settings = get_settings()
app = FastAPI(title=settings.app_name, version="2.0.0", description="NexPod owner dashboard backend", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origin_list,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"]
)
app.include_router(router)
