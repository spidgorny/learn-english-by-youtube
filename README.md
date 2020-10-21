# Learn English by YouTube

## Idea

While watching a talk or conversation on YouTube, I want to be able to see the translation of most complicated words.

It's like CC, but only for special words - words you most likely don't know.

This way I can learn additional terms without reading the whole CC text.

Target audience: intermediate language knowledge

## Steps

#. Copy/paste YouTube URL
#. Fetch CC from Google API
#. Filter out most common words
#. Translate special words to the target language
#. Show the translation WHEN IT'S NEEDED while video is playing

## Docs

* https://developers.google.com/youtube/iframe_api_reference?csw=1

## Language selection

* Python is better for NLP.
* Found NLP support in PHP and experimented with it.
* It has to switch to Python after proof-of-concept.

## Changelog

* 2019 experimented with Python access to Google API.
* 2019 experimented with Yandex translate.
* 2020 Yandex stopped working. Found another API from Oxford.
