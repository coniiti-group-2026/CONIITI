import os
import re

# Get path relative to the script location
script_dir = os.path.dirname(os.path.abspath(__file__))
dir_path = os.path.join(script_dir, "..", "Kubernetes", "microservicios")

if os.path.exists(dir_path):
    for filename in os.listdir(dir_path):
        if filename.endswith(".yaml") and filename != "frontend.yaml" and filename != "auth-service.yaml" and filename != "users-service.yaml":
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
else:
    print(f"Directory not found: {dir_path}")

