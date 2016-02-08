'use strict';

var _yamljs = require('yamljs');

var _yamljs2 = _interopRequireDefault(_yamljs);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _mkdirp = require('mkdirp');

var _mkdirp2 = _interopRequireDefault(_mkdirp);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function makePath(path) {
  _mkdirp2.default.sync(path);
}

function getPathFromFilePath(filePath) {
  return filePath.split('/').slice(0, -1).join('/');
}

function writeCredentials(filePath, credentials, next) {
  var yamlString = _yamljs2.default.stringify(credentials, 4);

  var path = getPathFromFilePath(filePath);
  makePath(path);

  _fs2.default.writeFile(filePath, yamlString, function (err) {
    if (err) {
      return next(err, null);
    } else {
      return next(null, true);
    }
  });
}

module.exports = writeCredentials;