#!/usr/bin/env node
'use strict';

var _commandLineArgs = require('command-line-args');

var _commandLineArgs2 = _interopRequireDefault(_commandLineArgs);

var _jsonfile = require('jsonfile');

var _jsonfile2 = _interopRequireDefault(_jsonfile);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _yamljs = require('yamljs');

var _yamljs2 = _interopRequireDefault(_yamljs);

var _inquirer = require('inquirer');

var _inquirer2 = _interopRequireDefault(_inquirer);

var _prompt = require('prompt');

var _prompt2 = _interopRequireDefault(_prompt);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _simpleSpinner = require('simple-spinner');

var _simpleSpinner2 = _interopRequireDefault(_simpleSpinner);

var _login = require('./login');

var _login2 = _interopRequireDefault(_login);

var _writeCredentials = require('./writeCredentials');

var _writeCredentials2 = _interopRequireDefault(_writeCredentials);

var _status = require('./status');

var _status2 = _interopRequireDefault(_status);

var _publish = require('./publish');

var _publish2 = _interopRequireDefault(_publish);

var _print = require('./print');

var _print2 = _interopRequireDefault(_print);

var _phrase = require('./generators/phrase');

var _phrase2 = _interopRequireDefault(_phrase);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

process.bin = process.title = 'composr-cli';
// Lib modules


/**
 * [getUserHome description]
 * @return {[type]} [description]
 */
var getUserHome = function getUserHome() {
  return process.env[process.platform === 'win32' ? 'USERPROFILE' : 'HOME'];
};
/**
 * Credentials
 */
var ACCESS_TOKEN = null;
var DOMAIN = null;
// CONST
var USER_HOME_ROOT = getUserHome() + '/.composr';
_prompt2.default.message = 'CompoSR'.cyan;
_prompt2.default.delimiter = '><'.green;

/**
 * [init description]
 * @return {[type]} [description]
 */
var init = function init(options) {
  _simpleSpinner2.default.start();
  initRC(function (err, result) {
    _simpleSpinner2.default.stop();
    if (err) _print2.default.error(err);
    locateComposrJson(function (err, result) {
      if (err) _print2.default.error(err);
      _print2.default.ok('CompoSR ready to rock!');
    });
  });
};
/**
 * PUBLISH
 */
var publish = function publish(options) {
  _simpleSpinner2.default.start();
  initRC(function (err, result) {
    if (err) _print2.default.error(err);
    locateComposrJson(function (err, config) {
      if (err) return _print2.default.error(err);
      config.ACCESS_TOKEN = ACCESS_TOKEN;
      (0, _publish2.default)(config, options);
    });
  });
};

/**
 * Generate Phrase
 */
// phraseGenerator(answers['name'], answers['url'], answers['verbs'])

var generatePhrase = function generatePhrase() {
  _inquirer2.default.prompt([{
    type: 'input',
    name: 'name',
    message: 'Which name would you like for your endpoint?',
    default: 'My Endpoint'
  }, {
    type: 'input',
    name: 'url',
    message: 'What is the URL of the endpoint?',
    default: ''
  }, {
    type: 'checkbox',
    name: 'verbs',
    message: 'Which verbs will respond to?',
    choices: ['get', 'post', 'put', 'delete'],
    default: 1
  }], function (answers) {
    console.log(answers);
    if (!answers['name']) {
      return _print2.default.error('Please choose a phrase name');
    }
    if (!answers['url']) {
      return _print2.default.error('Please choose a phrase url');
    }
    if (!answers['verbs']) {
      return _print2.default.error('Please select any verb');
    }
    (0, _phrase2.default)(answers['name'], answers['url'], answers['verbs'], null, function (err) {
      if (err) _print2.default.error(err);
    });
  });
};
/**
 * Get environments status
 */
var getStatus = function getStatus(options) {
  locateComposrJson(function (err, obj) {
    if (err) return _print2.default.error(err);
    var envStatus = obj.environments.map(function (url) {
      return url + '/status';
    });
    (0, _status2.default)(envStatus, _simpleSpinner2.default);
  });
};

/**
 * [locateComposrJson description]i
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
var locateComposrJson = function locateComposrJson(next) {
  _jsonfile2.default.readFile(process.cwd() + '/composr.json', function (err, obj) {
    if (!err) {
      next(null, obj);
    } else {
      var schema = {
        properties: {
          name: {
            message: 'Your composr vdomain name',
            default: _path2.default.basename(process.cwd()),
            type: 'string'
          },
          subdomain: {
            message: 'Your Subdomain name',
            default: '',
            type: 'string'
          },
          baseUri: {
            message: 'Your composr vdomain url',
            default: 'https://api.example.com',
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
            default: 'src/',
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
          }
        }
      };

      _prompt2.default.start();
      _prompt2.default.get(schema, function (err, result) {
        if (err) _print2.default.error(err);
        result.vd_dependencies = {};
        result.domain = DOMAIN;
        result.id = DOMAIN + '!' + result.name;
        result.environments = [];
        // creating composr.json
        _fs2.default.writeFile(process.cwd() + '/composr.json', JSON.stringify(result, null, 2), function (err) {
          if (err) return next(err, false);
          return next(null, true);
        });
      });
    }
  });
};

/**
 * initRC
 * @return next
 */
var initRC = function initRC(next) {
  if (!_fs2.default.existsSync(USER_HOME_ROOT)) _fs2.default.mkdirSync(USER_HOME_ROOT);
  locateRc(next);
};

/**
 * [locateRc description]
 * @return {[type]} [description]
 */
var locateRc = function locateRc(next) {
  _fs2.default.readFile(USER_HOME_ROOT + '/.composrc', 'utf8', function (err, credentialsYml) {
    if (err) {
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
        if (err) return _print2.default.error(err);

        var credentials = {
          clientId: result.clientId || null,
          clientSecret: result.clientSecret || null,
          scopes: result.scopes || null,
          urlBase: result.urlBase || null
        };

        loginClient(credentials, next);
      });
    } else {
      loginClient(_yamljs2.default.parse(credentialsYml), next);
    }
  });
};

/**
 * [login description]
 * @param  {[type]} credentials [description]
 * @return {[type]}             [description]
 */
var loginClient = function loginClient(credentials, next) {
  (0, _login2.default)(credentials, function (err, creds, domain) {
    if (err) {
      _simpleSpinner2.default.stop();
      _print2.default.error(err);
      return next(err, null);
    } else {
      _simpleSpinner2.default.stop();
      _print2.default.ok('Login successful');
      ACCESS_TOKEN = creds.access_token;
      DOMAIN = domain;
      return (0, _writeCredentials2.default)(USER_HOME_ROOT + '/.composrc', creds, next);
    }
  });
};
/**
 * ------------------
 * CLI INITIALIZATION
 * ------------------
 */
var cli = (0, _commandLineArgs2.default)([{
  name: 'publish',
  alias: 'p',
  type: Boolean
}, {
  name: 'init',
  alias: 'i',
  type: Boolean
}, {
  name: 'status',
  alias: 's',
  type: Boolean
}, {
  name: 'generate',
  alias: 'g',
  type: Boolean,
  defaultOption: false
}, {
  name: 'help',
  alias: 'h',
  type: String,
  defaultOption: true
}, {
  name: 'phrases',
  type: String,
  multiple: true
}, {
  name: 'version',
  alias: 'v',
  type: String
}, {
  name: 'environment',
  alias: 'e',
  type: String,
  multiple: true
}, {
  name: 'verbose',
  alias: 'b',
  type: Boolean
}]);

var options = cli.parse();

if (options.init === true) {
  _print2.default.ok('Initialization ...');
  init(options);
}
if (options.publish === true) {
  _print2.default.ok('Publish Loading ...');
  publish(options);
}
if (options.status === true) {
  _print2.default.ok('Loading environments status ...');
  getStatus(options);
}
if (options.generate === true) {
  _print2.default.ok('Generating X ...');
  generatePhrase();
}

if (options.help === true) {
  cli.getUsage();
}

/**
 * uncaughtException handler
 */
process.on('uncaughtException', function (err) {
  _print2.default.error('Caught exception: ' + err);
});