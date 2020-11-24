import os, random
from flask import Flask, request, jsonify
'''
    Import the DL model class here!! 
'''

# Create a flask application
app = Flask(__name__)

@app.route('/predict', methods=["POST"])
def predict():
    # get audio file and save it temporarily
    audioFile = request.files["file"]
    fileName = str(random.randint(10000, 100000))
    audioFile.save(fileName)

    # invoke DL model class here 
    # [Use constructor of class for faster subsequent prediction]

    # make prediction

    # remove temporary audioFile
    os.remove(audioFile)

    # send the prediction back to client
    prediction = {}
    return jsonify(prediction)
    pass

if __name__ == "__main__":
    app.run(debug=False)