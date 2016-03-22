'use strict'
import glob from 'glob'
import fs from 'fs'
import jsonSchemaGenerator from 'json-schema-generator'

/**
 * Build Responses for model
 */
const buildResponses = (phraseDir, phraseDirTmp, verb, phraseName, model, next) => {

  glob(phraseDir + '/*.' + verb + '.response.*[0-9].json', null, (err, files) => {
    if (err) return next(err, model)
    if (files.length > 0) {
      files.forEach((responseFileName) => {
        // responseFileName example:
        // 'src/phraseName/phraseName.get.response.401.json'
        let statusCode = responseFileName.split('.')
        statusCode = statusCode[statusCode.length - 2]

        let responseExample = fs.readFileSync(process.cwd() + '/' + responseFileName, 'utf8')
        responseExample = JSON.parse(responseExample)
        let schema
        try {
          schema = fs.readFileSync(process.cwd() + '/' + responseFileName.replace('.json', '.schema.json'))
        } catch (e) {
          schema = jsonSchemaGenerator(responseExample)
        }
        fs.writeFileSync(phraseDirTmp + phraseName + '.' + verb + '.response.' +
          statusCode + '.schema.json', JSON.stringify(schema, null, '\t'), 'utf8')

        model[verb].doc.responses[statusCode] = model[verb].doc.responses[statusCode] || {}
        model[verb].doc.responses[statusCode].body = model[verb].doc.responses[statusCode].body || {}
        model[verb].doc.responses[statusCode].body['application/json'] =
          model[verb].doc.responses[statusCode].body['application/json'] || {}
        model[verb].doc.responses[statusCode].body['application/json'].schema =
          JSON.stringify(schema, null, '\t')
        model[verb].doc.responses[statusCode].body['application/json'].example =
          JSON.stringify(responseExample, null, '\t')
      })
    }
    // Final/
    return next(null, model)
  })
}
module.exports = buildResponses
