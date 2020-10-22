import flask
from flask import request, jsonify

app = flask.Flask(__name__)
app.config["DEBUG"] = True


@app.route('/', methods=['GET'])
def home():
    return jsonify({
        "status": "ok",
        "html": "<h1>Distant Reading Archive</h1><p>This site is a prototype API for distant reading of science fiction novels.</p>"
    })


@app.route('/pons', methods=['GET'])
def pons():
    if 'id' in request.args:
        id = int(request.args['id'])
    else:
        return jsonify({
            "status": "error",
            "error": "Error: No id field provided. Please specify an id."
        })
    return jsonify({
        "status": "ok",
        "id": id,
        "translation": "asd"
    })


app.run()
