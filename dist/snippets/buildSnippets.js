'use strict';

var _glob = require('glob');

var _glob2 = _interopRequireDefault(_glob);

var _cli = require('cli');

var _cli2 = _interopRequireDefault(_cli);

var _async = require('async2');

var _async2 = _interopRequireDefault(_async);

var _gauge = require('gauge');

var _gauge2 = _interopRequireDefault(_gauge);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _mkdirp = require('mkdirp');

var _mkdirp2 = _interopRequireDefault(_mkdirp);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var gauge = new _gauge2.default();

/**
 * Locate model files
 */
var buildSnippet = function buildSnippet(next) {
  // progressBAr
  var progress = 0;
  (0, _glob2.default)('**/*.snippet.js', null, function (err, files) {
    if (err) return _cli2.default.error(err);
    var snippets = [];
    var increment = 1 / files.length;
    _cli2.default.ok(files.length + ' Snippets models founds');
    // bulk execution
    var buildSnippetExecList = [];
    var snippetDirTmp = process.cwd() + '/.tmp/src/snippets/';
    files.forEach(function (filePath) {
      buildSnippetExecList.push(function (callback) {
        progress += increment;
        var snippetDir = filePath.split('/');
        var snippetName = snippetDir[snippetDir.length - 1].replace('.snippet.js', '');
        snippetDir = filePath.replace(snippetDir[snippetDir.length - 1], '');
        var code = _fs2.default.readFileSync(filePath, 'utf8');
        var codehash = new Buffer(code).toString('base64');
        var id = 'booqs:nubico:chile!' + snippetName;
        var model = {
          id: id,
          codehash: codehash
        };
        snippets.push(model);
        gauge.show('Building Snippets → ' + snippetName, progress);
        _fs2.default.writeFileSync(snippetDirTmp + snippetName + '.snippet.json', JSON.stringify(model, null, '\t'));
        callback(null, model);
      });
    });
    executeBuild(buildSnippetExecList, next);
  });
};

var executeBuild = function executeBuild(list, next) {
  _async2.default.parallel(list, function (err, results) {
    gauge.hide();
    gauge.disable();
    if (err) _cli2.default.error(err);
    return next(err, results);
  });
};

var createTmpDir = function createTmpDir(next) {
  // create temporal directory
  (0, _mkdirp2.default)(process.cwd() + '/.tmp/src/snippets/', function (err) {
    if (err) return next(err, null);
    return next(err, null);
  });
};

var locateModels = function locateModels(next) {
  createTmpDir(function (err, result) {
    if (err) _cli2.default.error(err);
    buildSnippet(function (err, result) {
      return next(err, result);
    });
  });
};

module.exports = locateModels;