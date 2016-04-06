'use strict'
import print from './print'
import build from './build'
import rimraf from 'rimraf'
/**
 * Publish Module Entry
 */
const Publish = (config, options) => {
  // Execution all tasks in serie
  build(config, function(err, results){
    if (err) return print.error(err)
    print.ok('Publishing...')
  })
}

module.exports = Publish
