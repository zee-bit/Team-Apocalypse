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
