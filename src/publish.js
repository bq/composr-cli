'use strict'
import cli from 'cli'
import locateModels from './phrases/locateModels'
import rimraf from 'rimraf'
/**
 * Publish Module Entry
 */
const Publish = () => {
  cli.ok('Loading building...')
  rimraf(process.cwd() + '/.tmp', (err) => {
    if (err) return cli.error(err)
    locateModels()
  })
}

module.exports = Publish
