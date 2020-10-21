import requests
import json
from dotenv import load_dotenv
import os

load_dotenv()

app_key = os.getenv("PONS_KEY")
url = "https://api.pons.com/v1/dictionary?q=dog&l=enru&in=en&language=ru"
r = requests.get(url, headers={"X-Secret": app_key})
print(r.status_code, r.headers['content-type'])
parsed = r.json()
print(json.dumps(parsed, indent=4, sort_keys=True, ensure_ascii=False))
