'use strict'
import cli from 'cli'
import buildPhrases from './phrases/locateModels'
import buildSnippet from './snippets/buildSnippets'
import rimraf from 'rimraf'
/**
 * Publish Module Entry
 */
const Publish = () => {
  // Execution all tasks in series
  cli.ok('Loading building...')
  // Clean TMP Directory
  rimraf(process.cwd() + '/.tmp', (err) => {
    if (err) return cli.error(err)
    // Build Phrase tasks
    buildPhrases((err, result) => {
      if (err) cli.error(err)
      // Build Snippets tasks
      buildSnippet((err, result) => {
        if (err) return cli.error(err)
        cli.ok('All Phrases and snippets builts')
      })
    })
  })
}

module.exports = Publish
