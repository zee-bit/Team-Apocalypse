import wave
import contextlib
import sys
fileName = sys.argv[1]
with contextlib.closing(wave.open(fileName,'r')) as f:
    print(f.getnframes() / float(f.getframerate()))