import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Leemos la variable de entorno, o usamos un valor por defecto local
# Usamos las credenciales locales de postgres (como en el monolito) pero OTRA base de datos.
# El monolito usa 'coniiti', nosotros crearemos y usaremos 'coniiti_payments'
DATABASE_URL = os.getenv(
    "PAYMENTS_DATABASE_URL", 
    "postgresql://postgres:kevin12345@localhost:5432/coniiti_payments"
)

# Engine de SQLAlchemy
engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
