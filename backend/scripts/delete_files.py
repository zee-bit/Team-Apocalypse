import sys
import os
for filePath in sys.argv[1:]:
  if os.path.exists(filePath):
    os.remove(filePath)

print("Operation successful!")
sys.stdout.flush()