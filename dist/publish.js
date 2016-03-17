'use strict';

var _glob = require('glob');

var _glob2 = _interopRequireDefault(_glob);

var _cli = require('cli');

var _cli2 = _interopRequireDefault(_cli);

var _simpleSpinner = require('simple-spinner');

var _simpleSpinner2 = _interopRequireDefault(_simpleSpinner);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _mkdirp = require('mkdirp');

var _mkdirp2 = _interopRequireDefault(_mkdirp);

var _jsonSchemaGenerator = require('json-schema-generator');

var _jsonSchemaGenerator2 = _interopRequireDefault(_jsonSchemaGenerator);

var _async = require('async');

var _async2 = _interopRequireDefault(_async);

var _existsFile = require('exists-file');

var _existsFile2 = _interopRequireDefault(_existsFile);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * ------------------------------
 * Build Phrase
 * ------------------------------
 */
var buildPhrase = function buildPhrase(modelFilePath, next) {
  var phraseDir = modelFilePath.split('/');
  var phraseName = phraseDir[phraseDir.length - 1].replace('.model.json', '');
  phraseDir = modelFilePath.replace(phraseDir[phraseDir.length - 1], '');
  var tmpDir = process.cwd() + '/.tmp/';
  var phraseDirTmp = tmpDir + phraseDir.replace(tmpDir, '');
  var model = require(process.cwd() + '/' + modelFilePath);
  var codehash = undefined;

  // cli.ok('building phrase:', phraseName)
  // spinner.start()
  var sourceCodeListExec = [];

  (0, _glob2.default)(phraseDir + '/*.code.js', null, function (err, files) {
    if (err) return _cli2.default.error(err);
    files.forEach(function (file) {
      sourceCodeListExec.push(function (callback) {
        modelGeneration(file, phraseDir, phraseName, model, phraseDirTmp, function (err, result) {
          if (err) return callback(err, null);

          var fileNameModel = phraseDirTmp + phraseName + '.model.json';

          // sacar para otra funcion, añadir comprobaciones de respuestas y schema y middlewares
          (0, _mkdirp2.default)(phraseDirTmp, function (err) {
            if (err) return _cli2.default.error(err);
            _fs2.default.writeFileSync(fileNameModel, JSON.stringify(model, null, '\t'));
            // spinner.stop()
            return callback(null, result);
          });
        });
      });
    });
    // execution in parallel to build phrase model
    _async2.default.parallel(sourceCodeListExec, function (err, models) {
      return next(err, models);
    });
  });
};

/**
 * Code Generation
 */
var modelGeneration = function modelGeneration(file, phraseDir, phraseName, model, phraseDirTmp, next) {
  var fileSplit = file.split('.');
  var verb = fileSplit[fileSplit.length - 3];

  var codeFilePath = process.cwd() + '/' + phraseDir + phraseName + '.' + verb + '.code.js';
  // If file exists continue if not return
  var exists = (0, _existsFile2.default)(codeFilePath);
  if (!exists) return next('not exists', null);
  // continuar la ejecucion
  _cli2.default.ok('>> Reading file', codeFilePath);

  model[verb] = model[verb] || {};
  model[verb].doc = model[verb].doc || {};
  model[verb].doc.responses = model[verb].doc.responses || {};

  var code = _fs2.default.readFileSync(codeFilePath, 'utf8');

  model[verb].codehash = new Buffer(code).toString('base64');

  (0, _glob2.default)(phraseDir + '/*.' + verb + '.response.*[0-9].json', null, function (err, files) {
    if (err) return _cli2.default.error(err);
    files.forEach(function (responseFileName) {
      // responseFileName example:
      // 'src/phraseName/phraseName.get.response.401.json'
      var statusCode = responseFileName.split('.');
      statusCode = statusCode[statusCode.length - 2];

      var responseExample = require('./' + responseFileName);
      var schema = undefined;
      try {
        schema = require('./' + responseFileName.replace('.json', '.schema.json'));
      } catch (e) {
        _cli2.default.ok('autogenerate schema for', responseFileName);
        schema = (0, _jsonSchemaGenerator2.default)(responseExample);
        schema.$schema = schema.$schema.replace('http://json-schema.org/draft-04/schema#', 'http://json-schema.org/schema');
        _fs2.default.writeFileSync(phraseDirTmp + phraseName + '.' + verb + '.response.' + statusCode + '.schema.json', JSON.stringify(schema, null, '\t'), 'utf8');
      }

      model[verb].doc.responses[statusCode] = model[verb].doc.responses[statusCode] || {};
      model[verb].doc.responses[statusCode].body = model[verb].doc.responses[statusCode].body || {};
      model[verb].doc.responses[statusCode].body['application/json'] = model[verb].doc.responses[statusCode].body['application/json'] || {};
      model[verb].doc.responses[statusCode].body['application/json'].schema = JSON.stringify(schema, null, '\t');
      model[verb].doc.responses[statusCode].body['application/json'].example = JSON.stringify(responseExample, null, '\t');
    });

    // Final
    return next(null, model);
  });
};

/**
 * Locate model files
 */
var locateModels = function locateModels() {
  (0, _glob2.default)('**/*.model.json', null, function (err, files) {
    if (err) return _cli2.default.error(err);
    _cli2.default.ok('MODELS LOCATED');
    var phraseURLs = [];
    // bulk execution
    var buildPhrasesExecList = [];
    files.forEach(function (filePath) {
      buildPhrasesExecList.push(function (callback) {
        buildPhrase(filePath, function (model) {
          var response = { model: model, filePath: filePath };
          callback(null, response);
        });
      });
    });

    _async2.default.parallel(buildPhrasesExecList, function (err, results) {
      if (err) return _cli2.default.error(err);
      results.forEach(function (result) {
        if (phraseURLs.indexOf(result.model.url) !== -1) {
          _cli2.default.error('Phrase duplicated [' + result.model.url + '] ' + result.filePath);
        }
        phraseURLs.push(result.model.url);
      });
      return console.log(phraseURLs);
    });
  });
};

/**
 * Publish Module Entry
 */
var Publish = function Publish() {
  _cli2.default.ok('GETTING CONFIG');
  locateModels();
};

module.exports = Publish;