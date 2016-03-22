'use strict'
import fs from 'fs'
import buildResponse from './buildResponse'
import buildBodyResponse from './buildBodyResponse'
/**
 * Code Generation
 */
const modelGeneration = (file, phraseDir, phraseName, model, phraseDirTmp, next) => {
  let fileSplit = file.split('.')
  let verb = fileSplit[fileSplit.length - 3]
  model[verb] = model[verb] || {}
  model[verb].doc = model[verb].doc || {}
  model[verb].doc.responses = model[verb].doc.responses || {}

  let code = fs.readFileSync(file, 'utf8')
  model[verb].codehash = new Buffer(code).toString('base64')
  // Responses to model
  buildResponse(phraseDir, phraseDirTmp, verb, phraseName, model, (err, _model) => {
    if (err) console.log(err)
    // Build Body
    buildBodyResponse(phraseDir, phraseDirTmp, verb, phraseName, model, (err, __model) => {
      if (err) console.log(err)
      return next(null, model)
    })
  })
}

module.exports = modelGeneration
