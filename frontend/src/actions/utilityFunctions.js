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
      fs.unlink(path, (err) => {
        if (DEVELOPER_MODE && err)
          alert(err)
        if (err)
          return
      })
    })
  }
}

clearTemp = () => {
  const { DEVELOPER_MODE, TEMP_CLEAR_ON_CLOSE } = require('../actions/flags')
  if (!(DEVELOPER_MODE && !TEMP_CLEAR_ON_CLOSE)) {
    const fs = require('fs')
    const path = require('path')
    const tempDir = path.join(__dirname, "../../backend/temp")

    let fileList = fs.readdirSync(tempDir)
    fileList.forEach(fileName => {
      fileName = path.join(tempDir, fileName)
      fs.unlinkSync(fileName)
    })
  }
}