'use strict'
import glob from 'glob'
import cli from 'cli'
import async from 'async2'
import buildPhrase from './buildPhrase'
import Gauge from 'gauge'
let gauge = new Gauge()

/**
 * Locate model files
 */
const locateModels = () => {
  // progressBAr
  let progress = 0
  glob('**/*.model.json', null, (err, files) => {
    if (err) return cli.error(err)
    let phraseURLs = []
    let increment = (1 / files.length)
    cli.ok(files.length + ' Phrases models founds')
    // bulk execution
    let buildPhrasesExecList = []
    let phrasesCreated = []
    files.forEach(filePath => {
      progress += increment
      gauge.show('Building Phrases → ' + filePath, progress)
      buildPhrasesExecList.push((callback) => {
        buildPhrase(filePath, gauge, (err, model) => {
          if (err) {
            return callback(err)
          } else {
            let response = {model: model, filePath: filePath}
            phrasesCreated.push(response)
            return callback(null, response)
          }
        })
      })
    })

    gauge.hide()
    gauge.disable()

    async.parallel(buildPhrasesExecList, (err, results) => {
      if (err) cli.error(err)
      if (phrasesCreated.length > 0) {
        phrasesCreated.forEach(result => {
          if (phraseURLs.indexOf(result.model.url) !== -1) {
            cli.error('Phrase duplicated [' + result.model.url + '] ' + result.filePath)
          }
          phraseURLs.push(result.model.url)
        })
      }
      return console.log(phraseURLs)
    })
  })
}

module.exports = locateModels
