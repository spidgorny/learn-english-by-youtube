from dotenv import load_dotenv
import os
import redis
import sys

from src.ml_stripper import strip_tags
from src.pons_trans import PonsTrans

load_dotenv()


def main(word):
    r = redis.Redis(host=os.getenv('REDIS'), port=6379, db=0)
    # r.set('foo', 'bar')
    # value = r.get('foo')
    # print(value)
    p = PonsTrans(r)
    sobaka = p.translate_cached(word)
    if sobaka:
        plaintext = strip_tags(sobaka)
        # hex = binascii.hexlify(plaintext.encode('utf-8'))
        # hex = textwrap.wrap(str(hex)[2:], 4)
        # hex = ' '.join(hex)
        # print(word, plaintext, hex)
        print(plaintext)
    else:
        print('-')


main(sys.argv[1])
