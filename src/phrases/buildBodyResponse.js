'use strict'
import fs from 'fs'
import jsonSchemaGenerator from 'json-schema-generator'

/**
 * Build Responses for model
 */
const buildBodyResponse = (phraseDir, phraseDirTmp, verb, phraseName, model, next) => {
  let _model = model
  if (verb === 'post' || verb === 'put') {
    fs.readFile(process.cwd() + '/' + phraseDir + phraseName + '.' + verb + '.body.json', (err, file) => {
      if (err) return next(null, model)
      // requestFileName example:
      // 'src/phraseName/phraseName.get.body.json'
      let requestExample = JSON.parse(file)
      let schema
      try {
        schema = fs.readFileSync(process.cwd() + phraseDir + phraseName + '.' + verb + '.schema.json')
      } catch (e) {
        schema = jsonSchemaGenerator(requestExample)
      }
      fs.writeFileSync(phraseDirTmp + phraseName + '.' + verb + '.body' +
        '.schema.json', JSON.stringify(schema, null, '\t'))
      _model[verb].doc.body = _model[verb].doc.body || {}
      _model[verb].doc.body['application/json'] = _model[verb].doc.body['application/json'] || {}
      _model[verb].doc.body['application/json'].schema = JSON.stringify(schema, null, '\t')
      _model[verb].doc.body['application/json'].example = JSON.stringify(requestExample, null, '\t')
      return next(null, _model)
    })
  }
  return next(null, model)
}

module.exports = buildBodyResponse
