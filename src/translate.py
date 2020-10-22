# -*- coding: utf-8 -*-
# Imports the Google Cloud client library
from google.cloud import translate

from dotenv import load_dotenv
load_dotenv()

# import sys
# import codecs
# sys.stdout = codecs.getwriter('utf8')(sys.stdout)

# Instantiates a client
translate_client = translate.Client()

# The text to translate
text = u'Hello, world!'
# The target language
target = 'ru'

# Translates some text into Russian
translation = translate_client.translate(
    text,
    target_language=target)

print(u'Text: {}'.format(text))
print(u'Translation: {}'.format(translation['translatedText']))
