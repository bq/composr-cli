'use strict';
// Phrase Generator

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _mkdirp = require('mkdirp');

var _mkdirp2 = _interopRequireDefault(_mkdirp);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _async = require('async2');

var _async2 = _interopRequireDefault(_async);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var makePath = function makePath(path) {
  _mkdirp2.default.sync(path);
};

var exampleDocumentationForVerb = {
  'description': 'VERB documentation',
  'securedBy': ['oauth_2_0'],
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
};

var exampleResponse200 = {
  hello: "world"
};

var exampleResponse400 = {
  httpStatus: 400,
  error: 'bad:request',
  errorDescription: 'Bad request'
};

var exampleResponse401 = {
  httpStatus: 401,
  error: 'unauthorized',
  errorDescription: 'Unauthorized'
};

var exampleBodyRequest = {
  name: 'test',
  age: 10
};

var generatePhrase = function generatePhrase(phraseName, phraseUrl, verbs, rootFolder, next) {
  // Generate the phrase model
  var thePhrase = {
    url: phraseUrl
  };

  verbs = verbs ? verbs.map(_lodash2.default.toLower) : ['get', 'post', 'put', 'delete'];

  verbs.forEach(function (verb) {
    //Enable middlewars support.
    thePhrase[verb] = {
      middlewares: ['mock', 'validate']
    };
    thePhrase[verb].doc = _lodash2.default.cloneDeep(exampleDocumentationForVerb);
    thePhrase[verb].doc.description = _lodash2.default.replace(thePhrase[verb].doc.description, 'VERB', verb);
  });

  thePhrase = JSON.stringify(thePhrase, null, 2);

  // File names
  var sanitizedName = _lodash2.default.camelCase(phraseName);
  var phraseModelFileName = sanitizedName + '.model.json';

  // Create the phrase folder
  rootFolder = rootFolder ? rootFolder : process.cwd();
  var phraseFolderDir = rootFolder + '/' + sanitizedName;
  makePath(phraseFolderDir);

  // Write all the files
  var parallelWrites = [function (cb) {
    writeFile(phraseFolderDir + '/' + phraseModelFileName, thePhrase, cb);
  }];

  //Write the code files and the request / response examples
  verbs.forEach(function (verb) {
    var codeFileName = sanitizedName + '.' + verb + '.code.js';
    var response200FileName = sanitizedName + '.' + verb + '.response.200.json';
    var response400FileName = sanitizedName + '.' + verb + '.response.400.json';
    var response401FileName = sanitizedName + '.' + verb + '.response.401.json';
    var requestBodyFileName = sanitizedName + '.' + verb + '.body.json';

    parallelWrites.push(function (cb) {
      writeFile(phraseFolderDir + '/' + codeFileName, 'res.status(200).send({ hello : "world" })', cb);
    });

    parallelWrites.push(function (cb) {
      writeFile(phraseFolderDir + '/' + response200FileName, JSON.stringify(exampleResponse200, null, 2), cb);
    });

    parallelWrites.push(function (cb) {
      writeFile(phraseFolderDir + '/' + response400FileName, JSON.stringify(exampleResponse400, null, 2), cb);
    });

    parallelWrites.push(function (cb) {
      writeFile(phraseFolderDir + '/' + response401FileName, JSON.stringify(exampleResponse401, null, 2), cb);
    });

    if (verb === 'post' || verb === 'put') {
      parallelWrites.push(function (cb) {
        writeFile(phraseFolderDir + '/' + requestBodyFileName, JSON.stringify(exampleBodyRequest, null, 2), cb);
      });
    }
  });

  _async2.default.parallel(parallelWrites, function (err, results) {
    next(err, results);
  });
};

var writeFile = function writeFile(path, body, next) {
  _fs2.default.writeFile(path, body, function (err) {
    if (err) {
      return next(err, null);
    } else {
      return next(null, true);
    }
  });
};

module.exports = generatePhrase;