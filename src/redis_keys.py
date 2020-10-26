from dotenv import load_dotenv
import redis
import os
import pprint
import json

load_dotenv()

if not os.getenv('REDIS'):
    raise EnvironmentError('REDIS not configured in .env')

r = redis.Redis(host=os.getenv('REDIS'), port=6379, db=0)

keys = r.keys('*')
pprint.pp(keys)


def define(key):
    """
    :param key: string
    :return:
    """
    print('* ' + str(key))
    value = r.get(first)
    data = json.loads(value)
    pprint.pp(data)


first = keys[0]
define(first)
last = keys[-1]
define(last)