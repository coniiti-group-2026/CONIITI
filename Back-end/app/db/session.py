# Es el motor (engine) y la fábrica de sesiones
# Se usa en cada endpoint para hacer consultas
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# crear el motor de conexion usaldo la URL de config
engine = create_engine(settings.DATABASE_URL)

# crea la "fabrica de sesiones"
# si pone autocommit=false se tiene el contro de cuando guardar
SessionLocal = sessionmaker(autocommit=False,autoflush=False, bind=engine)

# dependencia que asegura abrir/cerrar la conexion cuando termine la peticion
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()