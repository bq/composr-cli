'use strict'
import print from './print'
import buildPhrases from './phrases/locateModels'
import buildSnippet from './snippets/buildSnippets'
import rimraf from 'rimraf'
/**
 * Publish Module Entry
 */
const Publish = (config, options) => {
  // Execution all tasks in serie
  print.ok('Loading building...')
  // Clean TMP Directory
  rimraf(process.cwd() + '/.tmp', (err) => {
    if (err) return print.error(err)
    // Build Phrase tasks
    buildPhrases(config, (err, result) => {
      if (err) print.error(err)
      // Build Snippets tasks
      buildSnippet(config, (err, result) => {
        if (err) return print.error(err)
        print.ok('All Phrases and snippets builts')
      })
    })
  })
}

module.exports = Publish
