import urllib.request
import json

url = "https://coniiti-api.onrender.com/auth/login"

req_options = urllib.request.Request(url, method="OPTIONS")
req_options.add_header("Origin", "https://coniiti-web.onrender.com")
req_options.add_header("Access-Control-Request-Method", "POST")

print("--- OPTIONS ---")
try:
    with urllib.request.urlopen(req_options) as response:
        print(response.status)
        print(response.headers)
except urllib.error.HTTPError as e:
    print(e.code)
    print(e.headers)
except Exception as e:
    print(e)

print("\n--- POST ---")
data = json.dumps({"email": "coniitiadmin@gmail.com", "password": "superadmin123"}).encode("utf-8")
req_post = urllib.request.Request(url, data=data, method="POST")
req_post.add_header("Origin", "https://coniiti-web.onrender.com")
req_post.add_header("Content-Type", "application/json")

try:
    with urllib.request.urlopen(req_post) as response:
        print(response.status)
        print(response.headers)
        print(response.read().decode())
except urllib.error.HTTPError as e:
    print(e.code)
    print(e.headers)
    print(e.read().decode())
except Exception as e:
    print(e)
