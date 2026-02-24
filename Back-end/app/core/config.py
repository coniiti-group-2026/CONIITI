from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "CONIITI API"
    # postgres:root por usuario y contraseña
    # Dejar el nombre 'user' y 'password'' por los que se usan en PostSQL local
    DATABASE_URL: str = "postgresql://postgres:kevin45@localhost:5432/coniiti_db?client_encoding=latin1"

    class Config:
        env_file = ".env"

settings = Settings()