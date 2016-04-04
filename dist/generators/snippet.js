'use strict';
// Snippet Generator

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var EXAMPLE_SNIPPET_CODE = _fs2.default.readFileSync(__dirname + '/examples/snippet-code.js');

var generateSnippet = function generateSnippet(snippetName, rootFolder, next) {
  // File names
  var sanitizedName = _lodash2.default.camelCase(snippetName);
  var snippetFileName = sanitizedName + '.snippet.js';

  // Create the phrase folder (TODO use the snippets folder)
  rootFolder = rootFolder ? rootFolder : process.cwd();

  writeFile(rootFolder + '/' + snippetFileName, EXAMPLE_SNIPPET_CODE, next);
};

var writeFile = function writeFile(path, body, next) {
  _fs2.default.writeFile(path, body, function (err) {
    if (err) {
      return next(err, null);
    } else {
      return next(null, true);
    }
  });
};

module.exports = generateSnippet;