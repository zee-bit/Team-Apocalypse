from flask import Flask, request, jsonify,Response
import requests
import time
import base64
from collections import OrderedDict
URL1 = "http://127.0.0.1:5000/transcribe"

URL2 = "http://127.0.0.1:5000/cont_transcribe"

URL3="http://127.0.0.1:5000/subtits"
FILE_PATH = "test/final_test.wav"
import sys



def with_requests(url):
    return requests.post(url, data=FILE_PATH,stream=True)

#data_dec is the variable that has the real time data and can be used in notes

if __name__ == "__main__":	

	if sys.argv[1]=='notes_stream':

		left_over=''
		for data in with_requests(URL2):


			data_dec=left_over+data.decode('utf-8')

			tmp=data_dec.split('*')

			for t in range(0,len(tmp)-1):
				print(tmp[t])

			if len(tmp)==1:
				print(data_dec)

			left_over=tmp[len(tmp)-1]

	if sys.argv[1]=='subtitles':

		response=requests.post(URL3,data=FILE_PATH)
		data=response.json()
		fin=data['sub']
		print(fin)


	if sys.argv[1]=='all_at_once':

		response = requests.post(URL1, data=FILE_PATH)
		data = response.json()
		final=data['transcribed_text']
		print("Transcribed sentence :\n {}".format(final))

