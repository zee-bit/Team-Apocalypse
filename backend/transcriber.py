import deepspeech
import numpy as np
import time
import wave
from flask import jsonify
from collections import OrderedDict

model_file_path = 'deepspeech-0.8.1-models.pbmm'
scorer_file_path = 'deepspeech-0.8.1-models.scorer'
lm_alpha = 0.75
lm_beta = 1.85
beam_width = 500


class transcribing_service:

	model=None


	_instance=None

	Text=None

	sub_arr=[]
	words=None
	final_sub=None
	batch_size=250
	sub_arr=[]
	def transcribe(self,file_path):
		buff=self.load_file(file_path)
		data16=np.frombuffer(buff, dtype=np.int16)
		text=self.model.stt(data16)
		return text



	def load_file(self,file_path):
		w = wave.open(file_path, 'r')

		rate = w.getframerate()
		frames = w.getnframes()
		_buffer = w.readframes(frames)

		return _buffer


	def cont_transcribing(self,file_path):
		ds_stream = self.model.createStream()
		buff=self.load_file(file_path)
		buffer_len = len(buff)
		offset = 0
		# self.batch_size = 200
		
		
		count=0


		while offset < buffer_len:
			end_offset = offset + self.batch_size
			chunk = buff[offset:end_offset]
			data16 = np.frombuffer(chunk, dtype=np.int16)
			ds_stream.feedAudioContent(data16)
			self.Text = ds_stream.intermediateDecode()

			tmp=self.Text.split()

			if(len(tmp)>count):
				self.sub_arr.append(end_offset/16000/2)
				count=count+1
			offset = end_offset

			yield self.Text
		

		

		self.words=self.Text.split()

		if (len(self.sub_arr)<len(self.words)):
			while(len(self.sub_arr)<len(self.words)):
				self.sub_arr.append(self.sub_arr[len(self.sub_arr)-1]+0.2)

		if (len(self.words)<len(self.sub_arr)):

			while(len(self.words)<len(self.sub_arr)):
				self.words.append(".")

		self.final_sub=zip(self.words,self.sub_arr)

		return self.Text

    
	# def return_text(self):
	# 	print(self.Text)		

def TRANSCRIBING_SERVICE():
	if transcribing_service._instance is None:
		transcribing_service._instance=transcribing_service()
		transcribing_service.model=deepspeech.Model(model_file_path)
		transcribing_service.model.enableExternalScorer(scorer_file_path)
		transcribing_service.model.setScorerAlphaBeta(lm_alpha, lm_beta)
		transcribing_service.model.setBeamWidth(beam_width)

	return transcribing_service._instance

if __name__=="__main__":
	ts=TRANSCRIBING_SERVICE()

	for t in ts.cont_transcribing("test/rec.wav"):
		print(t)