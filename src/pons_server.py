import flask
from flask import request, jsonify
import redis
from src.pons_trans import PonsTrans
import os

app = flask.Flask(__name__)
app.config["DEBUG"] = True

r = redis.Redis(host=os.getenv('REDIS'), port=6379, db=0)


@app.route('/', methods=['GET'])
def home():
    return jsonify({
        "status": "ok",
        "html": "<h1>Distant Reading Archive</h1><p>This site is a prototype API for distant reading of science "
                "fiction novels.</p> "
    })


@app.route('/pons', methods=['GET'])
def pons():
    if 'word' not in request.args:
        return jsonify({
            'status': "error",
            'error': "Error: No id field provided. Please specify an id."
        })
    word = request.args['word']
    p = PonsTrans(r)
    trans = p.translate_cached(word)
    return jsonify({
        'status': "ok",
        'word': word,
        'trans': trans,
    })


app.run()
