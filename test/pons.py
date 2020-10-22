import requests
import json
from dotenv import load_dotenv
import os
import redis
from urllib.parse import quote
from io import StringIO
from html.parser import HTMLParser
import binascii
import textwrap
import sys

load_dotenv()


def main(word):
    r = redis.Redis(host=os.getenv('REDIS'), port=6379, db=0)
    # r.set('foo', 'bar')
    # value = r.get('foo')
    # print(value)
    sobaka = translate_cached(r, word)
    if sobaka:
        plaintext = strip_tags(sobaka)
        # hex = binascii.hexlify(plaintext.encode('utf-8'))
        # hex = textwrap.wrap(str(hex)[2:], 4)
        # hex = ' '.join(hex)
        # print(word, plaintext, hex)
        print(plaintext)
    else:
        print('-')


def translate_cached(redis, word):
    """
    :type redis: Redis
    :type word: str
    """
    structure = fetch_translation_cached(redis, word)
    # print(json.dumps(structure, indent=4, sort_keys=True, ensure_ascii=False))
    try:
        sobaka = structure[0]['hits'][0]['roms'][0]['arabs'][0]['translations'][0]['target']
        return sobaka
    except TypeError:
        return None
    except KeyError:
        return None


def fetch_translation_cached(redis, word):
    prefix = "pons:"
    cached = redis.get(prefix + word)
    if cached:
        return json.loads(cached)
    translation = fetch_translation(word)
    redis.set(prefix + word, json.dumps(translation))
    return translation


def fetch_translation(word):
    app_key = os.getenv("PONS_KEY")
    url = "https://api.pons.com/v1/dictionary?q=" + quote(word) + "&l=enru&in=en&language=ru"
    r = requests.get(url, headers={"X-Secret": app_key})
    # print(r.status_code, r.headers['content-type'])
    if r.status_code != 200:
        return None
    parsed = r.json()
    return parsed


class MLStripper(HTMLParser):
    def __init__(self):
        super().__init__()
        self.reset()
        self.strict = False
        self.convert_charrefs = True
        self.text = StringIO()

    def handle_data(self, d):
        self.text.write(d)

    def get_data(self):
        return self.text.getvalue()


def strip_tags(html):
    s = MLStripper()
    s.feed(html)
    return s.get_data()


main(sys.argv[1])
