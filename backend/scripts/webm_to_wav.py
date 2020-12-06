import sys
import os
from datetime import datetime

inputFilePath = sys.argv[1]
if len(sys.argv) >= 3:
  outputFilePath = sys.argv[2]
else:
  outputFilePath = f"WAV_{datetime.now().strftime(f'%Y%m%d%H%M%S')}.wav"
if len(sys.argv) >= 4:
  start = sys.argv[3] or '0'
else:
  start = '0s'


import ffmpeg
(
  ffmpeg
  # .input(inputFilePath)
  .input(inputFilePath, ss=start)
  .audio
  .output(outputFilePath,  c='pcm_s16le', ac='1', ar='16000')
  .overwrite_output()
  .run()
)

print(os.path.abspath(outputFilePath))
sys.stdout.flush()