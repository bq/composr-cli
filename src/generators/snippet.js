'use strict'
// Snippet Generator
import fs from 'fs'
import _ from 'lodash'

let generateSnippet = (snippetName, rootFolder, next) => {
  // File names
  let sanitizedName = _.camelCase(snippetName)
  let snippetFileName = sanitizedName + '.snippet.js'
  let snippetCode = 'var text = "Hi I am an Snippet"; \n exports(text);';

  // Create the phrase folder (TODO use the snippets folder)
  rootFolder = rootFolder ? rootFolder : process.cwd()
  
  writeFile(rootFolder + '/' + snippetFileName, snippetCode, next)
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
