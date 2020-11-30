from flask import Flask, request, jsonify
import requests


URL = "http://127.0.0.1:5000/transcribe"



FILE_PATH = "test/rec.wav"


if __name__ == "__main__":	

	response = requests.post(URL, data=FILE_PATH)
	data = response.text

	print("Transcribed sentence: {}".format(data))