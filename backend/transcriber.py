import deepspeech
import numpy as np
import time
import wave

model_file_path = 'deepspeech-0.8.1-models.pbmm'
scorer_file_path = 'deepspeech-0.8.1-models.scorer'
lm_alpha = 0.75
lm_beta = 1.85
beam_width = 500


class transcribing_service:

	model=None


	_instance=None




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

	TEXT=ts.transcribe("rec.wav")
	print(TEXT)