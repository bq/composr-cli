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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

process.bin = process.title = 'composr-cli';

// CONST
var USER_HOME_ROOT = getUserHome() + '/.composr';
_prompt2.default.message = "CompoSR".cyan;
_prompt2.default.delimiter = "><".green;

// CLI
_cli2.default.parse({
    init: ['i', 'Create a composr.json in your project.'],
    publish: ['p', 'Publish all your phrases to CompoSR'],
    update: ['u', 'Update at CompoSR.io your composr.json']
});

_cli2.default.main(function (args, options) {
    /*cli.debug(JSON.stringify(options))
    cli.debug(args)*/
    if (options.init) init();
});

/**
 * [init description]
 * @return {[type]} [description]
 */
function init() {

    initRC(function (err, result) {
        locateComposrJson(function (err, result) {
            console.log('CompoSR ready to rock!');
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

    locateRc(next);
}

/**
 * [locateRc description]
 * @return {[type]} [description]
 */
function locateRc(next) {

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

                var credentials = {
                    clientId: result.clientId || null,
                    clientSecret: result.clientSecret || null,
                    scopes: result.scopes || null,
                    urlBase: result.urlBase || null
                };

                login(credentials, next);
            });
        } else {
            login(_yamljs2.default.parse(credentialsYml), next);
        }
    });
}

/**
 * [login description]
 * @param  {[type]} credentials [description]
 * @return {[type]}             [description]
 */
function login(credentials, next) {

    var corbelDriver = _corbelJs2.default.getDriver(credentials);

    corbelDriver.iam.token().create().then(function (response) {

        credentials.accessToken = response.data.accessToken;

        var yamlString = _yamljs2.default.stringify(credentials, 4);

        _fs2.default.writeFile(USER_HOME_ROOT + '/.composrc', yamlString, function (err) {
            if (err) throw err;
        });

        _cli2.default.ok('Login successfully:');
        return next(null, true);
    }).catch(function (err) {
        _cli2.default.error(err);
        return next(err, null);
    });
}

/**
 * [getUserHome description]
 * @return {[type]} [description]
 */
function getUserHome() {
    return process.env[process.platform == 'win32' ? 'USERPROFILE' : 'HOME'];
}