'use strict'
import glob from 'glob'
import cli from 'cli'
import spinner from 'simple-spinner'
import fs from 'fs'
import mkdirp from 'mkdirp'
import jsonSchemaGenerator from 'json-schema-generator'
/**
 * ------------------------------
 * Build Phrase
 * ------------------------------
 */
const buildPhrase = (modelFilePath, next) => {
  let phraseDir = modelFilePath.split('/')
  let phraseName = phraseDir[phraseDir.length - 1].replace('.model.json', '')
  phraseDir = modelFilePath.replace(phraseDir[phraseDir.length - 1], '')
  let tmpDir = process.cwd() + '/.tmp/'
  let phraseDirTmp = tmpDir + phraseDir.replace(tmpDir, '')
  let model = require(process.cwd() + '/' + modelFilePath)
  let codehash

  // cli.ok('building phrase:', phraseName)
  spinner.start()
  glob(phraseDir + '/*.code.js', null, (err, files) => {
    if (err) return cli.error(err)
    files.forEach((file) => {
      model = modelGeneration(file, phraseDir, phraseName, model, phraseDirTmp)
    })

    let fileNameModel = phraseDirTmp + phraseName + '.model.json'

    // sacar para otra funcion, añadir comprobaciones de respuestas y schema y middlewares
    mkdirp(phraseDirTmp, (err) => {
      if (err) return cli.error(err)
      fs.writeFileSync(fileNameModel, JSON.stringify(model, null, '\t'))
      spinner.stop()
      return next(model)
    })
  })
}
/**
 * Code Generation
 */
const modelGeneration = (file, phraseDir, phraseName, model, phraseDirTmp) => {
  let fileSplit = file.split('.')
  let verb = fileSplit[fileSplit.length - 3]

  let codeFilePath = process.cwd() + '/' + phraseDir + phraseName + '.' + verb + '.code.js'
  // If file exists continue if not return
  if (!fs.accessSync(codeFilePath)) return
  return model
}

/**
 * Locate model files
 */
const locateModels = () => {
  glob('**/*.model.json', null, (err, files) => {
    if (err) return cli.error(err)
    cli.ok('MODELS LOCATED')
    let phraseURLs = []
    files.forEach(filePath => {
      buildPhrase(filePath, (model) => {
        if (phraseURLs.indexOf(model.url) !== -1) {
          cli.error('Phrase duplicated [' + model.url + '] ' + filePath)
        }
        phraseURLs.push(model.url)
      })
    })
    return console.log(phraseURLs)
  })
}

/**
 * Publish Module Entry
 */
const Publish = () => {
  cli.ok('GETTING CONFIG')
  locateModels()
}

module.exports = Publish
