from fastapi import FastAPI 

app = FastAPI(
    title = "CONIITI API",
    description = "API para la gestión de CONIITI",
    version = "1.0.0"
)

@app.get("/")
def read_root():
    return {"message": "API CONIITI funcionando de forma correcta"}

