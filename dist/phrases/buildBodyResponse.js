'use strict';

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _jsonSchemaGenerator = require('json-schema-generator');

var _jsonSchemaGenerator2 = _interopRequireDefault(_jsonSchemaGenerator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Build Responses for model
 */
var buildBodyResponse = function buildBodyResponse(phraseDir, phraseDirTmp, verb, phraseName, model, next) {
  var _model = model;
  if (verb === 'post' || verb === 'put') {
    _fs2.default.readFile(process.cwd() + '/' + phraseDir + phraseName + '.' + verb + '.body.json', function (err, file) {
      if (err) return next(null, model);
      // requestFileName example:
      // 'src/phraseName/phraseName.get.body.json'
      var requestExample = JSON.parse(file);
      var schema = undefined;
      try {
        schema = _fs2.default.readFileSync(process.cwd() + phraseDir + phraseName + '.' + verb + '.schema.json');
      } catch (e) {
        schema = (0, _jsonSchemaGenerator2.default)(requestExample);
      }
      _fs2.default.writeFileSync(phraseDirTmp + phraseName + '.' + verb + '.body' + '.schema.json', JSON.stringify(schema, null, '\t'));
      _model[verb].doc.body = _model[verb].doc.body || {};
      _model[verb].doc.body['application/json'] = _model[verb].doc.body['application/json'] || {};
      _model[verb].doc.body['application/json'].schema = JSON.stringify(schema, null, '\t');
      _model[verb].doc.body['application/json'].example = JSON.stringify(requestExample, null, '\t');
      return next(null, _model);
    });
  }
  return next(null, model);
};

module.exports = buildBodyResponse;