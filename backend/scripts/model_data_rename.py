import sys
import os

[oldName, newName] = sys.argv[1:] or ['output1.wav', 'output.wav']

from shutil import move
move(oldName,newName)