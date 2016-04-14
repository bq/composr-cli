'use strict'
import print from './print'
import buildPhrases from './phrases/locateModels'
import buildSnippet from './snippets/buildSnippets'
import rimraf from 'rimraf'
/**
 * Publish Module Entry
 */
const Build = (config, cb) => {
  // Execution all tasks in serie
  print.ok('Loading building...')
  // Clean TMP Directory
  rimraf(process.cwd() + '/.tmp', (err) => {
    if (err) return cb(err)
    // Build Phrase tasks
    buildPhrases(config, (err, phrases) => {
      if (err) print.error(err)
      // Build Snippets tasks
      buildSnippet(config, (err, snippets) => {
        if (err) return cb(err)
        print.ok('All Phrases and snippets builts')
        cb(null, {
          phrases,
          snippets
        })
      })
    })
  })
}

module.exports = Build
