'use strict';

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _mkdirp = require('mkdirp');

var _mkdirp2 = _interopRequireDefault(_mkdirp);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _async = require('async2');

var _async2 = _interopRequireDefault(_async);

var _phrase = require('./phrase');

var _phrase2 = _interopRequireDefault(_phrase);

var _snippet = require('./snippet');

var _snippet2 = _interopRequireDefault(_snippet);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function makePath(path) {
  _mkdirp2.default.sync(path);
}

function bootstrapProject(rootFolder, next) {
  rootFolder = rootFolder ? rootFolder : process.cwd();

  var folders = ['phrases', 'snippets'];
  var codeFolder = rootFolder + '/src';
  var testFolder = rootFolder + '/test';
  var phrasesFolder = codeFolder + '/phrases';
  var snippetsFolder = codeFolder + '/snippets';

  makePath(codeFolder);
  makePath(testFolder);
  makePath(phrasesFolder);
  makePath(snippetsFolder);

  //Generate demo stuff
  var parallelWrites = [function (cb) {
    (0, _phrase2.default)('Example Phrase', 'demo/endpoint/:idparameter', ['get', 'post', 'put', 'delete'], phrasesFolder + '/', cb);
  }, function (cb) {
    (0, _snippet2.default)('Example Snippet', snippetsFolder + '/', cb);
  }];

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

module.exports = bootstrapProject;