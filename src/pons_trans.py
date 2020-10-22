import requests
import json
from urllib.parse import quote
import os


class PonsTrans:

    def __init__(self, redis):
        """
        :param redis: Redis
        """
        self.redis = redis

    def translate_cached(self, word):
        """
        :type word: str
        """
        structure = self.fetch_translation_cached(word)
        # print(json.dumps(structure, indent=4, sort_keys=True, ensure_ascii=False))
        try:
            sobaka = structure[0]['hits'][0]['roms'][0]['arabs'][0]['translations'][0]['target']
            return sobaka
        except TypeError:
            return None
        except KeyError:
            return None

    def fetch_translation_cached(self, word):
        prefix = "pons:"
        cached = self.redis.get(prefix + word)
        if cached:
            return json.loads(cached)
        translation = self.fetch_translation(word)
        self.redis.set(prefix + word, json.dumps(translation))
        return translation

    def fetch_translation(self, word):
        app_key = os.getenv("PONS_KEY")
        url = "https://api.pons.com/v1/dictionary?q=" + quote(word) + "&l=enru&in=en&language=ru"
        r = requests.get(url, headers={"X-Secret": app_key})
        # print(r.status_code, r.headers['content-type'])
        if r.status_code != 200:
            return None
        parsed = r.json()
        return parsed
