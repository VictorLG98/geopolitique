import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# Load environment variables (FastAPI runs in the cwd backend, or envs are already set)
# If .env exists in the current directory or parent, we can read it.
# To make it robust, we'll try importing dotenv or read from env directly.
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

DATABASE_URL = os.getenv("DATABASE_URL", "").strip()

if not DATABASE_URL:
    # Zero-config fallback to SQLite for local development convenience
    DATABASE_URL = "sqlite:///./geopolitique.db"

# SQLAlchemy compatibility fix for Neon/Heroku legacy postgres:// prefix
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

is_sqlite = DATABASE_URL.startswith("sqlite")
connect_args = {"check_same_thread": False} if is_sqlite else {}

engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
    pool_pre_ping=True,      # Detects dropped connections (Neon cierra conexiones idle)
    pool_recycle=300,        # Recicla conexiones cada 5 min antes de que Neon las cierre
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
