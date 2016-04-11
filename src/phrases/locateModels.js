'use strict'
import glob from 'glob'
import print from '../print'
import async from 'async2'
import buildPhrase from './buildPhrase'
import Gauge from 'gauge'
let gauge = new Gauge()

/**
 * Locate model files
 */
const locateModels = (config, next) => {
  // progressBAr
  let progress = 0
  glob('**/*.model.json', null, (err, files) => {
    if (err) return print.error(err)
    let phraseURLs = []
    let increment = (1 / files.length)
    print.ok(files.length + ' Phrases models founds')
    // bulk parallel execution
    let buildPhrasesExecList = []
    let phrasesCreated = []
    files.forEach(filePath => {
      progress += increment
      gauge.show('Building Phrases → ' + filePath, progress)
      buildPhrasesExecList.push((callback) => {
        buildPhrase(config, filePath, gauge, (err, model) => {
          if (err) {
            return callback(err)
          } else {
            phrasesCreated.push(model)
            return callback(null, model)
          }
        })
      })
    })

    gauge.hide()
    gauge.disable()

    async.parallel(buildPhrasesExecList, (err, results) => {
      if (err) print.error(err)
      if (phrasesCreated.length > 0) {
        phrasesCreated.forEach(result => {
          phraseURLs.push(result.url)
        })
      }
      
      return next(err, phrasesCreated)
    })
  })
}

module.exports = locateModels
