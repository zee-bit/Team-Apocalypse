import sys
import os

[listFilePath, outputFileName] = sys.argv[1:] or ['files2.txt', 'output1.wav']

import ffmpeg
(
  ffmpeg
  .input(listFilePath, format='concat', safe=0)
  .output(outputFileName, c='copy')
  .overwrite_output()
  .run()
)

print(os.path.abspath(outputFileName))
sys.stdout.flush()