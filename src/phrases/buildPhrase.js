'use strict'
import glob from 'glob'
import cli from 'cli'
import fs from 'fs'
import mkdirp from 'mkdirp'
import modelGeneration from './modelGeneration'
/**
 * ------------------------------
 * Build Phrase
 * ------------------------------
 */
const buildPhrase = (modelFilePath, gauge, next) => {
  let phraseDir = modelFilePath.split('/')
  let phraseName = phraseDir[phraseDir.length - 1].replace('.model.json', '')
  phraseDir = modelFilePath.replace(phraseDir[phraseDir.length - 1], '')
  let tmpDir = process.cwd() + '/.tmp/'
  let phraseDirTmp = tmpDir + phraseDir.replace(tmpDir, '')
  let model = require(process.cwd() + '/' + modelFilePath)
  gauge.pulse(phraseName)
  // Create temporal folder
  mkdirp(phraseDirTmp, (err) => {
    if (err) {
      cli.error(err)
      return next(err, null)
    }
    // looking for code files related to model
    glob(process.cwd() + '/' + phraseDir + '*.code.js', null, (err, files) => {
      if (err) return next(null, model)
      files.forEach((file) => {
        modelGeneration(file, phraseDir, phraseName, model, phraseDirTmp, (err, result) => {
          if (err) cli.error(err)
          let fileNameModel = phraseDirTmp + phraseName + '.model.json'
          fs.writeFileSync(fileNameModel, JSON.stringify(model, null, '\t'))
          // spinner.stop()
          return next(null, result)
        })
      })
    })
  })
}

module.exports = buildPhrase
