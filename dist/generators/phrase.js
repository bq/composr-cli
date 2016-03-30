'use strict';

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _mkdirp = require('mkdirp');

var _mkdirp2 = _interopRequireDefault(_mkdirp);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _async = require('async');

var _async2 = _interopRequireDefault(_async);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function makePath(path) {
  _mkdirp2.default.sync(path);
}

var exampleDocumentationForVerb = {
  "description": "VERB documentation",
  "securedBy": ["oauth_2_0"],
  "headers": {
    "Example-Header": {
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
};

function generatePhrase(phraseName, phraseUrl, verbs, rootFolder, next) {
  //Generate the phrase model
  var thePhrase = {
    url: phraseUrl
  };

  verbs = verbs ? verbs.map(_lodash2.default.toLower) : ['get', 'post', 'put', 'delete'];

  verbs.forEach(function (verb) {
    thePhrase[verb] = {};
    thePhrase[verb].doc = _lodash2.default.cloneDeep(exampleDocumentationForVerb);
    thePhrase[verb].doc.description = _lodash2.default.replace(thePhrase[verb].doc.description, 'VERB', verb);
  });

  thePhrase = JSON.stringify(thePhrase, null, 2);

  //File names
  var sanitizedName = _lodash2.default.camelCase(phraseName);
  var phraseModelFileName = sanitizedName + '.model.json';
  var phraseCodeFileNames = verbs.map(function (verb) {
    return sanitizedName + '.' + verb + '.code.js';
  });

  //Create the phrase folder
  rootFolder = rootFolder ? rootFolder : __dirname;
  var phraseFolderDir = rootFolder + '/' + sanitizedName;
  makePath(phraseFolderDir);

  //Write all the files
  var parallelWrites = [function (cb) {
    writeFile(phraseFolderDir + '/' + phraseModelFileName, thePhrase, cb);
  }];

  phraseCodeFileNames.forEach(function (fileName) {
    parallelWrites.push(function (cb) {
      writeFile(phraseFolderDir + '/' + fileName, 'res.status(200).send("ok")', cb);
    });
  });

  _async2.default.parallel(parallelWrites, function (err, results) {
    next(err, results);
  });
}

function writeFile(path, body, next) {
  _fs2.default.writeFile(path, body, function (err) {
    if (err) {
      return next(err, null);
    } else {
      return next(null, true);
    }
  });
}

module.exports = generatePhrase;