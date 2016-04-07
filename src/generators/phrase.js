'use strict'
// Phrase Generator
import fs from 'fs'
import mkdirp from 'mkdirp'
import _ from 'lodash'
import async from 'async2'

let EXAMPLE_PHRASE_CODE = fs.readFileSync(__dirname + '/templates/phrase-code.js');

let makePath = (path) => {
  mkdirp.sync(path)
}

let exampleDocumentationForVerb = {
  'description': 'VERB documentation',
  'securedBy': [
    'oauth_2_0'
  ],
  'headers': {
    'Example-Header': {
      'displayName': 'Example header',
      'description': 'A generated example'
    }
  },
  'responses': {
    '200': {
      'description': 'Valid Response'
    },
    '401': {
      'description': 'Not authorized'
    },
    '400': {
      'description': 'Bad request'
    },
    '500': {
      'description': 'Internal Server Error'
    }
  },
  'queryParameters': {
    'name': {
      'description': 'Example query parameter',
      'type': 'string',
      'example': '?name=Demo'
    },
    'number': {
      'default': 10,
      'description': 'Example query parameter',
      'type': 'number',
      'example': '?number=30'
    }
  }
}

let exampleResponse200 = { 
  hello : "world" 
}

let exampleResponse400 = {
  httpStatus: 400,
  error: 'bad:request',
  errorDescription: 'Bad request'
}

let exampleResponse401 = {
  httpStatus: 401,
  error: 'unauthorized',
  errorDescription: 'Unauthorized'
}

let exampleBodyRequest = {
  name: 'test',
  age: 10
}

let generatePhrase = (phraseName, phraseUrl, verbs, rootFolder, next) => {
  // Generate the phrase model
  let thePhrase = {
    url: phraseUrl
  }

  verbs = verbs ? verbs.map(_.toLower) : ['get', 'post', 'put', 'delete']

  verbs.forEach(function (verb) {
    //Enable middlewars support.
    thePhrase[verb] = {
      middlewares : ['mock', 'validate']
    }
    thePhrase[verb].doc = _.cloneDeep(exampleDocumentationForVerb)
    thePhrase[verb].doc.description = _.replace(thePhrase[verb].doc.description, 'VERB', verb)
  })

  thePhrase = JSON.stringify(thePhrase, null, 2)

  // File names
  let sanitizedName = _.camelCase(phraseName)
  let phraseModelFileName = sanitizedName + '.model.json'

  // Create the phrase folder
  rootFolder = rootFolder ? rootFolder : process.cwd()
  let phraseFolderDir = rootFolder + '/' + sanitizedName
  makePath(phraseFolderDir)

  // Write all the files
  var parallelWrites = [
    function (cb) {
      writeFile(phraseFolderDir + '/' + phraseModelFileName, thePhrase, cb)
    }
  ]

  //Write the code files and the request / response examples
  verbs.forEach(function (verb) {
    let codeFileName = sanitizedName + '.' + verb + '.code.js';
    let response200FileName = sanitizedName + '.' + verb + '.response.200.json';
    let response400FileName = sanitizedName + '.' + verb + '.response.400.json';
    let response401FileName = sanitizedName + '.' + verb + '.response.401.json';
    let requestBodyFileName = sanitizedName + '.' + verb + '.body.json';
    
    parallelWrites.push(function (cb) {
      writeFile(phraseFolderDir + '/' + codeFileName, EXAMPLE_PHRASE_CODE, cb)
    })

    parallelWrites.push(function (cb) {
      writeFile(phraseFolderDir + '/' + response200FileName, JSON.stringify(exampleResponse200, null, 2), cb)
    })

    parallelWrites.push(function (cb) {
      writeFile(phraseFolderDir + '/' + response400FileName, JSON.stringify(exampleResponse400, null, 2), cb)
    })

    parallelWrites.push(function (cb) {
      writeFile(phraseFolderDir + '/' + response401FileName, JSON.stringify(exampleResponse401, null, 2), cb)
    })

    if(verb === 'post' || verb === 'put'){
      parallelWrites.push(function (cb) {
        writeFile(phraseFolderDir + '/' + requestBodyFileName, JSON.stringify(exampleBodyRequest, null, 2), cb)
      })
    }
  })

  async.parallel(parallelWrites, function (err, results) {
    next(err, results)
  })
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

module.exports = generatePhrase
