'use strict';

var _cli = require('cli');

var _cli2 = _interopRequireDefault(_cli);

var _jsonfile = require('jsonfile');

var _jsonfile2 = _interopRequireDefault(_jsonfile);

var _util = require('util');

var _util2 = _interopRequireDefault(_util);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _yamljs = require('yamljs');

var _yamljs2 = _interopRequireDefault(_yamljs);

var _prompt = require('prompt');

var _prompt2 = _interopRequireDefault(_prompt);

var _async = require('async');

var _async2 = _interopRequireDefault(_async);

var _corbelJs = require('corbel-js');

var _corbelJs2 = _interopRequireDefault(_corbelJs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _login = require('./login');

var _login2 = _interopRequireDefault(_login);

var _writeCredentials = require('./writeCredentials');

var _writeCredentials2 = _interopRequireDefault(_writeCredentials);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

process.bin = process.title = 'composr-cli';

//Lib modules


// CONST
var USER_HOME_ROOT = getUserHome() + '/.composr';
var COMPOSR_RC_FILE_PATH = USER_HOME_ROOT + '/.composrrc';

_prompt2.default.message = "CompoSR".cyan;
_prompt2.default.delimiter = " - ".green;

// CLI
_cli2.default.parse({
  init: ['i', 'Create a composr.json in your project.'],
  publish: ['p', 'Publish all your phrases to CompoSR'],
  update: ['u', 'Update at CompoSR.io your composr.json']
});

_cli2.default.main(function (args, options) {
  /*cli.debug(JSON.stringify(options))
  cli.debug(args)*/
  _cli2.default.ok('Welcome to CompoSR');
  if (options.init) {
    _cli2.default.debug('>>> Bootstraping a new CompoSR application');
    init();
  } else if (options.publish) {
    _cli2.default.debug('>>> You are going to publish your endpoints');
  } else if (options.update) {
    _cli2.default.debug('>>> Your XXXX are going to be updated in 10 seconds');
  }
});

/**
 * [init description]
 * @return {[type]} [description]
 */
function init() {
  initRC(function (err, result) {
    locateComposrJson(function (err, result) {
      _cli2.default.ok('CompoSR ready to rock!');
    });
  });
}

/**
 * [locateComposrJson description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
function locateComposrJson(next) {

  _jsonfile2.default.readFile(process.cwd() + '/composr.json', function (err, obj) {
    if (!err) {
      _cli2.default.ok(':: Your Initialization is done ::');
      _cli2.default.info('U can use CPO ^^');
      next(null, true);
    } else {

      var schema = {
        properties: {
          name: {
            message: 'Your composr vdomain name',
            default: _path2.default.basename(process.cwd()),
            type: 'string'
          },
          author: {
            message: 'Your name',
            default: _path2.default.basename(getUserHome()),
            type: 'string'
          },
          version: {
            message: 'Version',
            default: '1.0.0',
            type: 'string'
          },
          source_location: {
            message: 'Where is my phrases code?',
            default: './src',
            type: 'string'
          },
          git: {
            message: 'Git repository url',
            default: '',
            type: 'string'
          },
          license: {
            message: 'License',
            default: 'MIT',
            type: 'string'
          },
          mock_middleware: {
            message: 'Do you want activate mock middleware?',
            default: false,
            type: 'boolean'
          },
          validate_middleware: {
            message: 'Do you want activate validate middleware?',
            default: false,
            type: 'boolean'
          }
        }
      };

      _prompt2.default.start();
      _prompt2.default.get(schema, function (err, result) {

        result.vd_dependencies = {};

        // creating composr.json
        _fs2.default.writeFile(process.cwd() + '/composr.json', JSON.stringify(result, null, 2), function (err) {
          if (err) {
            return next(err, false);
            throw err;
          }

          return next(null, true);
        });
      });
    }
  });
}

function initRC(next) {

  if (!_fs2.default.existsSync(USER_HOME_ROOT)) _fs2.default.mkdirSync(USER_HOME_ROOT);

  getUserCredentials(function (err, credentials) {
    if (err) {
      return next(err, null);
    } else {
      return loginClient(credentials, next);
    }
  });
}

/**
 * [locateRc description]
 * @return {[type]} [description]
 */
function getUserCredentials(next) {

  _fs2.default.readFile(COMPOSR_RC_FILE_PATH, 'utf8', function (err, credentialsYml) {
    if (err) {
      _cli2.default.info('We were unable to find your CompoSR credentials, please enter them to continue:');

      askForCredentials(function (err, credentials) {
        if (err) {
          next(err, null);
        } else {
          next(null, credentials);
        }
      });
    } else {
      next(null, _yamljs2.default.parse(credentialsYml));
    }
  });
}

function askForCredentials(next) {
  // start prompt
  _prompt2.default.start();
  //
  _prompt2.default.get([{
    name: 'clientId',
    required: true,
    conform: function conform(value) {
      return true;
    }
  }, {
    name: 'clientSecret',
    required: true,
    conform: function conform(value) {
      return true;
    }
  }, {
    name: 'scopes',
    required: true,
    conform: function conform(value) {
      return true;
    }
  }, {
    name: 'urlBase',
    required: true,
    conform: function conform(value) {
      return true;
    }
  }], function (err, result) {

    var credentials = {
      clientId: result.clientId || null,
      clientSecret: result.clientSecret || null,
      scopes: result.scopes || null,
      urlBase: result.urlBase || null
    };

    next(err, credentials);
  });
}

/**
 * [login description]
 * @param  {[type]} credentials [description]
 * @return {[type]}             [description]
 */
function loginClient(credentials, next) {

  (0, _login2.default)(credentials, function (err, creds) {
    if (err) {
      _cli2.default.error(JSON.stringify(err, null, 2));
      return next(err, null);
    } else {
      _cli2.default.ok('Login successful');
      return (0, _writeCredentials2.default)(COMPOSR_RC_FILE_PATH, creds, next);
    }
  });
}

/**
 * [getUserHome description]
 * @return {[type]} [description]
 */
function getUserHome() {
  return process.env[process.platform === 'win32' ? 'USERPROFILE' : 'HOME'];
}