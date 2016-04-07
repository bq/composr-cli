'use strict'
import glob from 'glob'
import print from '../print'
import fs from 'fs'
import mkdirp from 'mkdirp'
import modelGeneration from './modelGeneration'
import modelValidator from './modelValidator'
/**
 * ------------------------------
 * Build Phrase
 * ------------------------------
 */
const buildPhrase = (config, modelFilePath, gauge, next) => {
  let phraseDir = modelFilePath.split('/')
  let phraseName = phraseDir[phraseDir.length - 1].replace('.model.json', '')
  phraseDir = modelFilePath.replace(phraseDir[phraseDir.length - 1], '')
  let tmpDir = process.cwd() + '/.tmp/'
  let phraseDirTmp = tmpDir + phraseDir.replace(tmpDir, '')
  let model = require(process.cwd() + '/' + modelFilePath)
  gauge.pulse(phraseName)
  // call to build phrase  
  toBuild(phraseDirTmp, phraseDir, phraseName, config, model, next)
}

const toBuild = (phraseDirTmp, phraseDir, phraseName, config, model, next) => {
  // Create temporal folder
  mkdirp(phraseDirTmp, (err) => {
    if (err) {
      print.error(err)
      return next(err, null)
    }
    // looking for code files related to model
    glob(process.cwd() + '/' + phraseDir + '*.code.js', null, (err, files) => {
      if (err) return next(null, model)
      files.forEach((file) => {
        modelGeneration(file, phraseDir, phraseName, model, phraseDirTmp, (err, result) => {
          if (err) print.error(err)
          model.version = config.version
          let fileNameModel = phraseDirTmp + phraseName + '.model.json'
          modelValidator({ model , phraseName}, (err, result) => {
            if (!err) {
              fs.writeFileSync(fileNameModel, JSON.stringify(model, null, '\t'))
              return next(null, result)
            }
            return next(err, null)
          })
        })
      })
    })
  })
}

module.exports = buildPhrase
