from flask import Flask, request, jsonify,current_app
import random
import os
from transcriber import TRANSCRIBING_SERVICE

app=Flask(__name__)


@app.route("/transcribe", methods=["POST"])
def transcribe():


	audio_file_path=request.data

	ts=TRANSCRIBING_SERVICE()
	transcribed_text=ts.transcribe(audio_file_path.decode('ascii'))

	result={"keyword": transcribed_text}

	return jsonify(result)

if __name__=="__main__":
	app.run(debug=False)