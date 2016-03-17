'use strict'
import glob from 'glob'
import cli from 'cli'
import spinner from 'simple-spinner'
import fs from 'fs'
import mkdirp from 'mkdirp'
import jsonSchemaGenerator from 'json-schema-generator'
import async from 'async'
import existsFile from 'exists-file'
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
  // spinner.start()
  let sourceCodeListExec = []

  glob(phraseDir + '/*.code.js', null, (err, files) => {
    if (err) return cli.error(err)
    files.forEach((file) => {
      sourceCodeListExec.push((callback) => {
        modelGeneration(file, phraseDir, phraseName, model, phraseDirTmp, (err, result) => {
          if (err) return callback(err, null)

          let fileNameModel = phraseDirTmp + phraseName + '.model.json'

          // sacar para otra funcion, añadir comprobaciones de respuestas y schema y middlewares
          mkdirp(phraseDirTmp, (err) => {
            if (err) return cli.error(err)
            fs.writeFileSync(fileNameModel, JSON.stringify(model, null, '\t'))
            // spinner.stop()
            return callback(null, result)
          })
        })
      })
    })
    // execution in parallel to build phrase model
    async.parallel(sourceCodeListExec, (err, models) => {
      return next(err, models)
    })
  })
}

/**
 * Code Generation
 */
const modelGeneration = (file, phraseDir, phraseName, model, phraseDirTmp, next) => {
  let fileSplit = file.split('.')
  let verb = fileSplit[fileSplit.length - 3]

  let codeFilePath = process.cwd() + '/' + phraseDir + phraseName + '.' + verb + '.code.js'
  // If file exists continue if not return
  let exists = existsFile(codeFilePath)
  if (!exists) return next('not exists', null)
  // continuar la ejecucion
  cli.ok('>> Reading file', codeFilePath)

  model[verb] = model[verb] || {}
  model[verb].doc = model[verb].doc || {}
  model[verb].doc.responses = model[verb].doc.responses || {}

  let code = fs.readFileSync(codeFilePath, 'utf8')

  model[verb].codehash = new Buffer(code).toString('base64')

  glob(phraseDir + '/*.' + verb + '.response.*[0-9].json', null, (err, files) => {
    if (err) return cli.error(err)
    files.forEach((responseFileName) => {
      // responseFileName example:
      // 'src/phraseName/phraseName.get.response.401.json'
      let statusCode = responseFileName.split('.')
      statusCode = statusCode[statusCode.length - 2]

      let responseExample = require('./' + responseFileName)
      let schema
      try {
        schema = require('./' + responseFileName.replace('.json', '.schema.json'))
      } catch (e) {
        cli.ok('autogenerate schema for', responseFileName)
        schema = jsonSchemaGenerator(responseExample)
        schema.$schema = schema.$schema.replace(
          'http://json-schema.org/draft-04/schema#',
          'http://json-schema.org/schema'
        )
        fs.writeFileSync(phraseDirTmp + phraseName + '.' + verb + '.response.' +
          statusCode + '.schema.json', JSON.stringify(schema, null, '\t'), 'utf8')
      }

      model[verb].doc.responses[statusCode] = model[verb].doc.responses[statusCode] || {}
      model[verb].doc.responses[statusCode].body = model[verb].doc.responses[statusCode].body || {}
      model[verb].doc.responses[statusCode].body['application/json'] =
        model[verb].doc.responses[statusCode].body['application/json'] || {}
      model[verb].doc.responses[statusCode].body['application/json'].schema =
        JSON.stringify(schema, null, '\t')
      model[verb].doc.responses[statusCode].body['application/json'].example =
        JSON.stringify(responseExample, null, '\t')
    })

    // Final
    return next(null, model)
  })
}

/**
 * Locate model files
 */
const locateModels = () => {
  glob('**/*.model.json', null, (err, files) => {
    if (err) return cli.error(err)
    cli.ok('MODELS LOCATED')
    let phraseURLs = []
    // bulk execution
    let buildPhrasesExecList = []
    files.forEach(filePath => {
      buildPhrasesExecList.push((callback) => {
        buildPhrase(filePath, (model) => {
          let response = {model: model, filePath: filePath}
          callback(null, response)
        })
      })
    })

    async.parallel(buildPhrasesExecList, (err, results) => {
      if (err) return cli.error(err)
      results.forEach(result => {
        if (phraseURLs.indexOf(result.model.url) !== -1) {
          cli.error('Phrase duplicated [' + result.model.url + '] ' + result.filePath)
        }
        phraseURLs.push(result.model.url)
      })
      return console.log(phraseURLs)
    })
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
