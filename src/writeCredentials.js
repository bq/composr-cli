'use strict'

import YAML from 'yamljs'
import fs from 'fs'
import mkdirp from 'mkdirp'

function makePath (path) {
  mkdirp.sync(path)
}

function getPathFromFilePath (filePath) {
  return filePath.split('/').slice(0, -1).join('/')
}

function writeCredentials(filePath, credentials, next){
  let yamlString = YAML.stringify(credentials, 4);

  var path = getPathFromFilePath(filePath)
  makePath(path);

  fs.writeFile(filePath, yamlString, (err) => {
    if (err) {
      return next(err, null);
    }else{
      return next(null, true);
    }
  })
}

module.exports = writeCredentials