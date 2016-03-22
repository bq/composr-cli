'use strict';

var _glob = require('glob');

var _glob2 = _interopRequireDefault(_glob);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _jsonSchemaGenerator = require('json-schema-generator');

var _jsonSchemaGenerator2 = _interopRequireDefault(_jsonSchemaGenerator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Build Responses for model
 */
var buildResponses = function buildResponses(phraseDir, phraseDirTmp, verb, phraseName, model, next) {

  (0, _glob2.default)(phraseDir + '/*.' + verb + '.response.*[0-9].json', null, function (err, files) {
    if (err) return next(err, model);
    if (files.length > 0) {
      files.forEach(function (responseFileName) {
        // responseFileName example:
        // 'src/phraseName/phraseName.get.response.401.json'
        var statusCode = responseFileName.split('.');
        statusCode = statusCode[statusCode.length - 2];

        var responseExample = _fs2.default.readFileSync(process.cwd() + '/' + responseFileName, 'utf8');
        responseExample = JSON.parse(responseExample);
        var schema = undefined;
        try {
          schema = _fs2.default.readFileSync(process.cwd() + '/' + responseFileName.replace('.json', '.schema.json'));
        } catch (e) {
          schema = (0, _jsonSchemaGenerator2.default)(responseExample);
        }
        _fs2.default.writeFileSync(phraseDirTmp + phraseName + '.' + verb + '.response.' + statusCode + '.schema.json', JSON.stringify(schema, null, '\t'), 'utf8');

        model[verb].doc.responses[statusCode] = model[verb].doc.responses[statusCode] || {};
        model[verb].doc.responses[statusCode].body = model[verb].doc.responses[statusCode].body || {};
        model[verb].doc.responses[statusCode].body['application/json'] = model[verb].doc.responses[statusCode].body['application/json'] || {};
        model[verb].doc.responses[statusCode].body['application/json'].schema = JSON.stringify(schema, null, '\t');
        model[verb].doc.responses[statusCode].body['application/json'].example = JSON.stringify(responseExample, null, '\t');
      });
    }
    // Final/
    return next(null, model);
  });
};
module.exports = buildResponses;