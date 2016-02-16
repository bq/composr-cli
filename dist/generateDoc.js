'use strict';

var _raml2html = require('raml2html');

var _raml2html2 = _interopRequireDefault(_raml2html);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var configWithDefaultTemplates = _raml2html2.default.getDefaultConfig();

function generateDoc(config, next) {
  console.log(config.api_raml_location);
  _raml2html2.default.render(process.cwd() + '/' + config.api_raml_location, configWithDefaultTemplates).then(function (result) {
    // Save the result to a file or do something else with the result
    _fs2.default.writeFile(process.cwd() + '/api.html', result, function (err) {
      if (err) {
        return next(err, false);
      }
      return next(null, true);
    });
  }, function (err) {
    return next(err, null);
  });
}

module.exports = generateDoc;