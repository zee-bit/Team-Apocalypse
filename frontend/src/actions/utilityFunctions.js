const path = require('path')
const fs = require('fs')
const { DEVELOPER_MODE, DELETE_FILES, TEMP_CLEAR_ON_CLOSE } = require(path.join(__dirname, "flags"))

exports.createFolder = (folderPath) => {
  fs.promises.access(folderPath, fs.constants.F_OK)
    .catch(async () => {
      fs.promises.mkdir(folderPath)
        .catch((error) => {
          if (DEVELOPER_MODE)
            console.error("Creating Folder error:", error)
        })
    })
}

exports.deleteFiles = (fileList) => {
  if (!(DEVELOPER_MODE && !DELETE_FILES)) {
    fileList.forEach(filePath => {
      fs.promises.unlink(filePath)
        .catch((error) => { if (DEVELOPER_MODE) console.error("Deleting FIle", error) })
    })
  }
}

exports.clearFolder = async (folderPath, options = {}) => {
  if (!(DEVELOPER_MODE && !TEMP_CLEAR_ON_CLOSE)) {
    try {
      const fileList = await fs.promises.readdir(folderPath, { withFileTypes: true });

      if (("directory" in options && options.directory) || !("directory" in options)) {
        fileList.filter(dirent => dirent.isDirectory()).forEach(dirent => {
          fs.promises.rmdir(path.join(folderPath, dirent.name))
            .catch(error => { if (DEVELOPER_MODE) console.error("Deleting directory:", error) })
        })
      }
      if (("file" in options && options.file) || !("file" in options)) {
        fileList.filter(dirent => dirent.isFile()).forEach(dirent => {
          fs.promises.unlink(path.join(folderPath, dirent.name))
            .catch(error => { if (DEVELOPER_MODE) console.error("Deleting file:", error) })
        })
      }
    } catch (error) { if (DEVELOPER_MODE) console.error("Listing files error:", error) }
  }
}