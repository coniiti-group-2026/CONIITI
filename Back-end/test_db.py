from sqlalchemy import text
from app.db.session import SessionLocal

def test_connection():
    try:
        db = SessionLocal()
        # Intentamos hacer una consulta simple "SELECT 1"
        # Nota: SessionLocal() devuelve una sesión, no es ejecutable directamente.
        # Usamos db.execute()
        result = db.execute(text("SELECT 1"))
        print("\n✅ ¡CONEXIÓN EXITOSA! La base de datos responde correctamente.\n")
    except Exception as e:
        print("\n❌ ERROR DE CONEXIÓN:", e)
        print("Revisa tu usuario, contraseña y que el servicio de Postgres esté corriendo.\n")
    finally:
        db.close()

if __name__ == "__main__":
    test_connection()