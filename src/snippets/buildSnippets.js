'use strict'
import glob from 'glob'
import print from '../print'
import async from 'async2'
import Gauge from 'gauge'
import fs from 'fs'
import mkdirp from 'mkdirp'
let gauge = new Gauge()

/**
 * Locate model files
 */
const buildSnippet = (config, next) => {
  // progressBAr
  let progress = 0
  glob('**/*.snippet.js', null, (err, files) => {
    if (err) return print.error(err)
    let snippets = []
    let increment = (1 / files.length)
    print.ok(files.length + ' Snippets models founds')
    // bulk execution
    let buildSnippetExecList = []
    let snippetDirTmp = process.cwd() + '/.tmp/src/snippets/'
    files.forEach(filePath => {
      buildSnippetExecList.push((callback) => {
        progress += increment
        let snippetDir = filePath.split('/')
        let snippetName = snippetDir[snippetDir.length - 1].replace('.snippet.js', '')
        snippetDir = filePath.replace(snippetDir[snippetDir.length - 1], '')
        let code = fs.readFileSync(filePath, 'utf8')
        let codehash = new Buffer(code).toString('base64')
        let model = {
          name: snippetName,
          version: config.version,
          codehash: codehash
        }
        snippets.push(model)
        gauge.show('Building Snippets → ' + snippetName, progress)
        fs.writeFileSync(snippetDirTmp + snippetName + '.snippet.json', JSON.stringify(model, null, '\t'))
        callback(null, model)
      })
    })
    executeBuild(buildSnippetExecList, next)
  })
}

const executeBuild = (list, next) => {
  async.parallel(list, (err, results) => {
    gauge.hide()
    gauge.disable()
    if (err) print.error(err)
    return next(err, results)
  })
}

const createTmpDir = (next) => {
  // create temporal directory
  mkdirp(process.cwd() + '/.tmp/src/snippets/', (err) => {
    if (err) return next(err, null)
    return next(err, null)
  })
}

const locateModels = (config, next) => {
  createTmpDir((err, result) => {
    if (err) print.error(err)
    buildSnippet(config, (err, result) => {
      return next(err, result)
    })
  })
}

module.exports = locateModels
