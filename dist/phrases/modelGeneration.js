'use strict';

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _buildResponse = require('./buildResponse');

var _buildResponse2 = _interopRequireDefault(_buildResponse);

var _buildBodyResponse = require('./buildBodyResponse');

var _buildBodyResponse2 = _interopRequireDefault(_buildBodyResponse);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Code Generation
 */
var modelGeneration = function modelGeneration(file, phraseDir, phraseName, model, phraseDirTmp, next) {
  var fileSplit = file.split('.');
  var verb = fileSplit[fileSplit.length - 3];
  model[verb] = model[verb] || {};
  model[verb].doc = model[verb].doc || {};
  model[verb].doc.responses = model[verb].doc.responses || {};

  var code = _fs2.default.readFileSync(file, 'utf8');
  model[verb].codehash = new Buffer(code).toString('base64');
  // Responses to model
  (0, _buildResponse2.default)(phraseDir, phraseDirTmp, verb, phraseName, model, function (err, _model) {
    if (err) console.log(err);
    // Build Body
    (0, _buildBodyResponse2.default)(phraseDir, phraseDirTmp, verb, phraseName, model, function (err, __model) {
      if (err) console.log(err);
      return next(null, model);
    });
  });
};

module.exports = modelGeneration;