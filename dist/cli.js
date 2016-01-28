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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

process.bin = process.title = 'composr-cli';

/*let i = 0, interval = setInterval(function () {
      cli.progress(++i / 100);
      if (i === 100) {
          clearInterval(interval);
          cli.ok('Finished!');
      }
  }, 50);*/

_cli2.default.parse({
    init: ['i', 'Create a composr.json in your project.'],
    publish: ['p', 'Publish all your phrases to CompoSR'],
    update: ['u', 'Update at CompoSR.io your composr.json']
});

_cli2.default.main(function (args, options) {
    _cli2.default.debug(JSON.stringify(options));
    _cli2.default.debug(args);
    if (options.init) init();
});

function init() {

    //async.series()
    locateRc();
}

function locateComposrJson(next) {

    var file = process.cwd() + '/composr.json';

    _jsonfile2.default.readFile(file, function (err, obj) {
        if (!err) {
            console.dir(obj);
        } else {
            _cli2.default.error('Json not found');
        }
    });
}

function locateRc() {

    /*
    "corbel.composr.credentials": {
        "clientId": "9bdbd5c5",
        "clientSecret": "34f848098c9f79e3b675154add9cc6aa7d06625f85a531568ef930be98c83aab",
        "scopes": "composr:comp:admin"
    },
    "corbel.driver.options": {
        "urlBase": "https://proxy-next.bqws.io/{{module}}/v1.0/"
    },
     'clientSecret','scopes','urlBase'
     */

    _fs2.default.readFile(process.cwd() + '/.composrc', 'utf8', function (err, data) {

        if (err) {

            _prompt2.default.message = "CompoSR-cli!".cyan;
            _prompt2.default.delimiter = "><".green;
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

                var yamlString = _yamljs2.default.stringify(credentials, 4);

                _fs2.default.writeFile(process.cwd() + '/.composrc', yamlString, function (err) {
                    if (err) throw err;

                    _fs2.default.appendFile(process.cwd() + '/.gitignore', '.composrc', function (err) {
                        if (err) throw err;
                    });

                    _cli2.default.ok('.composrc created successfully!');
                });

                login(credentials);
            });
        } else {
            return _cli2.default.ok('.composrc found!');
        }
    });
}

function login(credentials) {

    var corbelDriver = _corbelJs2.default.getDriver(credentials);

    corbelDriver.iam.token().create().then(function (userTokens) {

        _cli2.default.ok('Login successfully:');
        _cli2.default.info(JSON.stringify(userTokens));
    }).catch(function (err) {
        _cli2.default.error(err);
    });
}