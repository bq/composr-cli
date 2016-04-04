'use strict'
// Snippet Generator
import fs from 'fs'
import _ from 'lodash'

let EXAMPLE_SNIPPET_CODE = fs.readFileSync(__dirname + '/examples/snippet-code.js');

let generateSnippet = (snippetName, rootFolder, next) => {
  // File names
  let sanitizedName = _.camelCase(snippetName)
  let snippetFileName = sanitizedName + '.snippet.js'

  // Create the phrase folder (TODO use the snippets folder)
  rootFolder = rootFolder ? rootFolder : process.cwd()
  
  writeFile(rootFolder + '/' + snippetFileName, EXAMPLE_SNIPPET_CODE, next)
}

let writeFile = (path, body, next) => {
  fs.writeFile(path, body, (err) => {
    if (err) {
      return next(err, null)
    } else {
      return next(null, true)
    }
  })
}

module.exports = generateSnippet
