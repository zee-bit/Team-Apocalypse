import sys
import os
from datetime import datetime

inputFileName = sys.argv[1]

if len(sys.argv) == 3:
  outputFileName = sys.argv[2]
else:
  outputFileName = f"AUD_{datetime.now().strftime(f'%Y%m%d%H%M%S')}.mp3"

import ffmpeg
(
  ffmpeg
  .input(inputFileName)
  .output(outputFileName)
  .overwrite_output()
  .run()
)

print(os.path.abspath(outputFileName))
sys.stdout.flush()