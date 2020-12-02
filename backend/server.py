from flask import Flask, request, jsonify,Response,stream_with_context
import random
import os
from transcriber import TRANSCRIBING_SERVICE
import time

app=Flask(__name__)


@app.route("/transcribe", methods=["POST"])
def transcribe():


	audio_file_path=request.data

	ts=TRANSCRIBING_SERVICE()
	transcribed_text=ts.transcribe(audio_file_path.decode('ascii'))

	result={"transcribed_text": transcribed_text}

	return jsonify(result)

@app.route("/cont_transcribe", methods=["POST"])
def cont_transcribe():


	audio_file_path=request.data

	ts=TRANSCRIBING_SERVICE()
	ts.batch_size=200
	def conti():
		for transcribed_text in ts.cont_transcribing(audio_file_path.decode('ascii')):
			
			yield (transcribed_text+'*').encode('utf-8')
			
	return Response(stream_with_context(conti()),mimetype='text/event-stream')


@app.route("/subtits", methods=["POST"])
def subtits():


	audio_file_path=request.data

	ts=TRANSCRIBING_SERVICE()
	ts.batch_size=16384
	for t in ts.cont_transcribing(audio_file_path.decode('ascii')):
		pass

	result=ts.final_sub
	final=list(result)
	return jsonify({'sub':final})


if __name__=="__main__":
	app.run(debug=True)