'use strict'

import fs from 'fs'
import mkdirp from 'mkdirp'
import _ from 'lodash'
import async from 'async2'
import phraseGenerator from './phrase'
import snippetsGenerator from './snippet'

function makePath (path) {
  mkdirp.sync(path)
}

function bootstrapProject(rootFolder, next){
  rootFolder = rootFolder ? rootFolder : process.cwd()

  let folders = ['phrases', 'snippets']
  let codeFolder = rootFolder + '/src'
  let testFolder = rootFolder + '/test'
  let phrasesFolder = codeFolder + '/phrases'
  let snippetsFolder = codeFolder + '/snippets'
  
  makePath(codeFolder)
  makePath(testFolder)
  makePath(phrasesFolder)
  makePath(snippetsFolder)

  //Generate demo stuff
  var parallelWrites = [
    function (cb) {
      phraseGenerator('Example Phrase', 'example/:idparameter', ['get', 'post', 'put', 'delete'], phrasesFolder + '/', cb)
    },
    function(cb){
      snippetsGenerator('User Model', snippetsFolder + '/', cb);
    }
  ]

  async.parallel(parallelWrites, function (err, results) {
    next(err, results)
  })
}

function writeFile(path, body, next){
  fs.writeFile(path, body, (err) => {
    if (err) {
      return next(err, null);
    }else{
      return next(null, true);
    }
  })
}

module.exports = bootstrapProject