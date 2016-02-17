'use strict';

var _ramllint = require('ramllint');

var _ramllint2 = _interopRequireDefault(_ramllint);

var _raml2obj = require('raml2obj');

var _raml2obj2 = _interopRequireDefault(_raml2obj);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _crypto = require('crypto');

var _crypto2 = _interopRequireDefault(_crypto);

var _zlib = require('zlib');

var _zlib2 = _interopRequireDefault(_zlib);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ramllint = new _ramllint2.default();

function parseRaml(dev, config, next) {
  var ramlLoc = process.cwd() + '/' + config.api_raml_location;
  ramllint.lint(ramlLoc, function (results) {
    if ( /* !results.length ||*/dev) {
      _raml2obj2.default.parse(ramlLoc).then(function (ramlObj) {
        writeToComposrJson(config, ramlObj, next);
      });
    } else {
      return next(results, null);
    }
  });
}

/**
 * Write Composr Json with parsed API Raml,
 * to decode: new Buffer("SGVsbG8gV29ybGQ=", 'base64').toString('ascii')
 */
function writeToComposrJson(config, ramlObj, next) {
  var apiParsed = JSON.stringify(ramlObj);
  config._raml = {
    hash: new Buffer(apiParsed).toString('base64'),
    md5: _crypto2.default.createHash('md5').update(apiParsed).digest('hex')
  };
  _fs2.default.writeFile(process.cwd() + '/.composr', JSON.stringify(config, null, 2), 'utf8', function (err) {
    if (err) return next(err, null);
    compressFile(function (err, result) {
      if (!err) return next(null, true);
      return next(err, null);
    });
  });
}

function compressFile(next) {
  var gzip = _zlib2.default.createGzip();
  var inp = _fs2.default.createReadStream(process.cwd() + '/.composr');
  var out = _fs2.default.createWriteStream(process.cwd() + '/.composr.gz');
  inp.pipe(gzip).pipe(out);
  return next();
}
module.exports = parseRaml;