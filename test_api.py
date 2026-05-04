import urllib.request
import json

data = json.dumps({"prompt": "deliver to Sector 17", "available_locations": [{"name": "Sector 17 Market"}]}).encode('utf-8')
req = urllib.request.Request("http://127.0.0.1:5000/api/chat-route", data=data, headers={'Content-Type': 'application/json'})
try:
    response = urllib.request.urlopen(req)
    print("Success:", response.read().decode())
except urllib.error.HTTPError as e:
    print("Error:", e.code, e.read().decode())
