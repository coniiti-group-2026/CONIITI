import os
import re

dir_path = r"C:\Users\User\Desktop\CONIITI\kubernetes\microservicios"

for filename in os.listdir(dir_path):
    if filename.endswith(".yaml") and filename != "frontend.yaml" and filename != "auth-service.yaml":
        filepath = os.path.join(dir_path, filename)
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()
        
        service_name = filename.replace(".yaml", "")
        if "command: [" not in content:
            # Reemplazar la línea de image y resources
            target = f"image: {service_name}:latest"
            replacement = f'image: {service_name}:latest\n        command: ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--root-path", "/api/{service_name.replace("-service", "")}"]'
            content = content.replace(target, replacement)
            
            with open(filepath, "w", encoding="utf-8") as f:
                f.write(content)
            print(f"Updated {filename}")
