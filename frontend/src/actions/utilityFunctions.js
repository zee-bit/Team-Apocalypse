exports.createTempFolder = () => {
  const { DEVELOPER_MODE } = require('./flags')
  const path = require('path')
  const fs = require('fs');
  const tempDir = path.join(__dirname, "../../../backend/temp")

  fs.access(tempDir, fs.constants.F_OK, (err) => {
    if (err)
      fs.mkdir(tempDir, (err) => {
        if (DEVELOPER_MODE)
          console.log(`${err ? err : "Temp created successfully."}`)
      });
  });
}

exports.deleteFiles = (fileList) => {
  const { DEVELOPER_MODE, DELETE_FILES } = require('./flags')
  if (!(DEVELOPER_MODE && !DELETE_FILES)) {
    const fs = require('fs')
    fileList.forEach(path => {
      fs.unlink(path)
    })
  }
}

exports.tempClear = () => {
  const { DEVELOPER_MODE, TEMP_CLEAR_ON_CLOSE } = require('./flags')
  if (!(DEVELOPER_MODE && !TEMP_CLEAR_ON_CLOSE)) {
    const fs = require('fs')
    const tempDir = path.join(__dirname, "../../../backend/temp")

    fs.readdir(tempDir, (err, fileList) => {
      if (err) {
        if (DEVELOPER_MODE)
          console.log("Error in getting contents of temp directory:", err)
        return
      }
      fileList.forEach(path => fs.unlink(path))
    })
  }
}