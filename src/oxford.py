import requests
import json
from dotenv import load_dotenv
import os

load_dotenv()

app_id = os.getenv("OXFORD_APP")
app_key = os.getenv("OXFORD_KEY")
language = "en-gb"
word_id = "example"
base = "https://od-api.oxforddictionaries.com:443/api/v2"
url = base + "/entries/" + language + "/" + word_id.lower()
url = base + "/translations/en/ru/hello"
r = requests.get(url, headers={"app_id": app_id, "app_key": app_key})
print(r.status_code, r.headers['content-type'])
print(r.json())
