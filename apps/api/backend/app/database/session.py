from sqlalchemy import create_engine, event
from sqlalchemy.orm import DeclarativeBase, sessionmaker
from ..core.config import get_settings


class Base(DeclarativeBase):
    pass


_session_factory = None


def get_session_factory():
    global _session_factory
    if _session_factory is not None:
        return _session_factory
        
    url = get_settings().database_url
    if not url:
        return None
    if url.startswith("postgresql://"):
        url = url.replace("postgresql://", "postgresql+psycopg://", 1)
    engine = create_engine(url, pool_pre_ping=True, future=True)
    
    @event.listens_for(engine, "connect")
    def disable_prepared_statements(dbapi_connection, connection_record):
        dbapi_connection.prepare_threshold = None
        
    _session_factory = sessionmaker(bind=engine, expire_on_commit=False)
    return _session_factory
