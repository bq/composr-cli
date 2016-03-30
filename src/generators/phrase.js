'use strict'

import fs from 'fs'
import mkdirp from 'mkdirp'
import _ from 'lodash'
import async from 'async'

function makePath (path) {
  mkdirp.sync(path)
}

let exampleDocumentationForVerb = {
  "description": "VERB documentation",
  "securedBy": [
    "oauth_2_0"
  ],
  "headers": {
    "Example-Header" : {
      "displayName": "Example header",
      "description": "A generated example"
    }
  },
  "responses": {
    "200": {
      "description": "Valid Response"
    },
    "401": {
      "description": "Not authorized"
    },
    "400": {
      "description": "Bad request"
    },
    "500": {
      "description": "Internal Server Error"
    }
  },
  "queryParameters": {
    "name": {
      "description": "Example query parameter",
      "type": "string",
      "example": "?name=Demo"
    },
    "number": {
      "default": 10,
      "description": "Example query parameter",
      "type": "number",
      "example": "?number=30"
    }
  }
}

function generatePhrase(phraseName, phraseUrl, verbs, rootFolder, next){
  //Generate the phrase model
  let thePhrase = {
    url : phraseUrl
  }

  verbs = verbs ? verbs.map(_.toLower) : ['get', 'post', 'put', 'delete']

  verbs.forEach(function(verb){
    thePhrase[verb] = {}
    thePhrase[verb].doc = _.cloneDeep(exampleDocumentationForVerb);
    thePhrase[verb].doc.description = _.replace(thePhrase[verb].doc.description, 'VERB', verb);
  });

  thePhrase = JSON.stringify(thePhrase, null, 2)

  //File names
  let sanitizedName = _.camelCase(phraseName);
  let phraseModelFileName = sanitizedName + '.model.json'
  let phraseCodeFileNames = verbs.map(function(verb){
    return sanitizedName + '.' + verb + '.code.js'
  })

  //Create the phrase folder
  rootFolder = rootFolder ? rootFolder : __dirname
  let phraseFolderDir = rootFolder + '/' + sanitizedName;
  makePath(phraseFolderDir);

  //Write all the files
  var parallelWrites = [
    function(cb){
      writeFile(phraseFolderDir + '/' + phraseModelFileName, thePhrase, cb)
    }
  ];

  phraseCodeFileNames.forEach(function(fileName){
    parallelWrites.push(function(cb){
      writeFile(phraseFolderDir + '/' + fileName, 'res.status(200).send("ok")', cb)
    })
  })

  async.parallel(parallelWrites, function(err, results){
    next(err, results)
  });
}

function writeFile(path, body, next){
  fs.writeFile(path, body, (err) => {
    if (err) {
      return next(err, null);
    }else{
      return next(null, true);
    }
  })
}

module.exports = generatePhrase