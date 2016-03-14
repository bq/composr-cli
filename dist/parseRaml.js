'use strict';

var _ramllint = require('ramllint');

var _ramllint2 = _interopRequireDefault(_ramllint);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _crypto = require('crypto');

var _crypto2 = _interopRequireDefault(_crypto);

var _zlib = require('zlib');

var _zlib2 = _interopRequireDefault(_zlib);

var _raml2obj = require('raml2obj');

var _raml2obj2 = _interopRequireDefault(_raml2obj);

var _cli = require('cli');

var _cli2 = _interopRequireDefault(_cli);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _recursiveReaddir = require('recursive-readdir');

var _recursiveReaddir2 = _interopRequireDefault(_recursiveReaddir);

var _async = require('async');

var _async2 = _interopRequireDefault(_async);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Instances
var ramllint = new _ramllint2.default();
// Consts
var CONFIG = {};
/**
 * Entry Point
 */
var parseRaml = function parseRaml(dev, config, next) {
  CONFIG = config;
  var ramlLoc = process.cwd() + '/' + CONFIG.api_raml_location;
  _fs2.default.readFile(ramlLoc, function (err, data) {
    var exists = err ? false : true;

    if (exists) {
      decodeRaml(config, ramlLoc, function (err, result) {
        if (err) return next(err, null);
        getRoutesFilesPaths(result, function (err, objToComposrJson) {
          if (err) return next(err, null);
          writeToComposrJson(config, objToComposrJson, next);
        });
      });
    } else {
      return next(err, null);
    }
  });
};

/**
 * Decode Raml
 */
var decodeRaml = function decodeRaml(config, ramlLoc, next) {
  ramllint.lint(ramlLoc, function (results) {
    if ( /* !results.length ||*/true) {
      _raml2obj2.default.parse(ramlLoc).then(function (ramlObj) {
        // get phrases codes
        searchPhrasesOnResource(ramlObj.resources, function (err, result) {
          if (err) return next(err, null);
          // console.log(JSON.stringify(result, null, 2))
          _cli2.default.ok('RAML encoding done');
          var response = {
            ramlObj: ramlObj,
            phrases: result
          };
          return next(null, response);
        });
      }, function (err) {
        // REturn error if raml load cant get raml
        return next(err, null);
      });
    } else {
      // if verification is failed
      return next(results, null);
    }
  });
};
/**
 * Function to encode code src to base64 hash
 */
var getRoutesFilesPaths = function getRoutesFilesPaths(ramlObj, next) {
  var completePath = process.cwd() + '/' + CONFIG.source_location;
  var ramlRoutes = ramlObj.phrases.map(function (route) {
    if (_lodash2.default.has(route, 'get')) return route.get.code_path;
    if (_lodash2.default.has(route, 'put')) return route.put.code_path;
    if (_lodash2.default.has(route, 'post')) return route.post.code_path;
    if (_lodash2.default.has(route, 'delete')) return route.delete.code_path;
  });
  var phrases = [];
  // Search code files in path
  (0, _recursiveReaddir2.default)(completePath, function (err, files) {
    if (err) return next(err, null);
    // Compare results with API raml routes
    compareFiles(files, ramlRoutes, function (err, results) {
      // Handler files founded and correspond with API route
      if (err) return next(err, null);
      _async2.default.filter(results, function (file, callback) {
        codeToHash(file.path, function (err, hashObj) {
          file.hash = hashObj;
          phrases.push(file);
          callback(null, !err);
        });
      }, function (results) {
        return next(null, phrases);
      });
    });
  });
};
/**
 * Write Composr Json with parsed API Raml,
 * to decode: new Buffer("SGVsbG8gV29ybGQ=", 'base64').toString('ascii')
 */
var writeToComposrJson = function writeToComposrJson(config, ramlObj, next) {
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
};
/**
 * Compare files betwen API RAMl and FS founded files
 */
var compareFiles = function compareFiles(files, ramlRoutes, next) {
  // Get filename from path
  var filesToCompare = files.map(function (route) {
    var _fileName = route.split('/');
    return _fileName[_fileName.length - 1];
  });
  // Get filename and file path together
  var filesCompleteObj = files.map(function (route) {
    var fileName = route.split('/');
    var fileObj = {};
    fileObj.fileName = fileName[fileName.length - 1];
    fileObj.path = route;
    return fileObj;
  });
  // difference betwen files from raml routes and FS
  var filesFounded = _lodash2.default.intersection(ramlRoutes, filesToCompare);
  _cli2.default.info('==============================');
  _cli2.default.info('| Routes without source code: |');
  _cli2.default.info('==============================');
  _lodash2.default.difference(ramlRoutes, filesToCompare).map(function (route) {
    _cli2.default.info(route);
  });
  console.log('\n');
  _cli2.default.ok('==============================');
  _cli2.default.ok('| Routes With source code:    |');
  _cli2.default.ok('==============================');
  filesFounded = filesFounded.map(function (route) {
    _cli2.default.ok(route);
    var indexRoute = _lodash2.default.findIndex(filesCompleteObj, function (o) {
      return o.fileName === route;
    });
    var resObj = {
      path: filesCompleteObj[indexRoute].path,
      phraseIndex: ramlRoutes.indexOf(route)
    };
    return resObj;
  });

  return next(null, filesFounded);
};
/**
 * code to Hash
 */
var codeToHash = function codeToHash(filePath, next) {
  _fs2.default.readFile(filePath, function (err, data) {
    if (err) return next(err, null);
    return next(null, {
      hash: new Buffer(data).toString('base64'),
      md5: _crypto2.default.createHash('md5').update(data).digest('hex')
    });
  });
};
/**
 * Compress File to distribution
 */
var compressFile = function compressFile(next) {
  var gzip = _zlib2.default.createGzip();
  var inp = _fs2.default.createReadStream(process.cwd() + '/.composr');
  var out = _fs2.default.createWriteStream(process.cwd() + '/.composr.gz');
  inp.pipe(gzip).pipe(out);
  return next();
};
/**
 * get Routes And Code
 */
var searchPhrasesOnResource = function searchPhrasesOnResource(resources, next) {
  var __phrases = [];

  var recursive = function recursive(resources, accumulatedPath) {
    if (!resources) {
      return null;
    }

    resources.forEach(function (resource) {
      var path = accumulatedPath + resource.relativeUri;

      if (resource.methods) {
        var phrase = {};
        phrase.url = path.replace('{mediaTypeExtension}', '');
        phrase.url = phrase.url.replace(/{(.*?)}/i, '');
        // TODO: Aqui hay que generar el id con formato domain!project!version!url!params
        phrase.id = '<id>';

        resource.methods.forEach(function (method) {
          phrase[method.method] = {};
          phrase[method.method].code = '<codehash>';
          /**
           * CODE FILES PATTERN
           * [path1].[path2].[,...].[httpMethod].code.js
           */
          var pathParts = phrase.url.split('/');
          var tempPath = '';
          pathParts.forEach(function (part) {
            if (part !== '') tempPath += part + '.';
          });
          tempPath += method.method + '.code.js';
          phrase[method.method].code_path = tempPath;
          // TODO: Aqui irían los middlewares
          phrase[method.method].middlewares = ['validate', 'mock'];
        });

        __phrases.push(phrase);
      }
      recursive(resource.resources, path);
    });

    return __phrases;
  };

  var parsedPhrases = recursive(resources, '');

  return next(null, parsedPhrases);
};

module.exports = parseRaml;