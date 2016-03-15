'use strict';

var _request2 = require('request');

var _request3 = _interopRequireDefault(_request2);

var _cliTable = require('cli-table');

var _cliTable2 = _interopRequireDefault(_cliTable);

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _request = function _request(urls, callback) {
  'use strict';

  var results = {};
  var t = urls.length;
  var c = 0;
  var handler = function handler(error, response, body) {

    var url = response.request.uri.href;

    results[url] = {
      error: error,
      response: response,
      body: body
    };

    if (++c === urls.length) {
      callback(results);
    }
  };

  while (t--) {
    (0, _request3.default)(urls[t], handler);
  }
};
var status = function status(environmentsUrls, spinner) {
  spinner.start();
  _request(environmentsUrls, function (responses) {
    spinner.stop();
    var table = new _cliTable2.default({
      head: ['Url', 'Env', 'Domains', 'Version', 'Phrases', 'Phrases Loaded', 'Worker', 'IAM', 'Resources', 'Assets', 'Evci']
    });

    for (var url in responses) {
      var res = responses[url];
      if (res.error) {
        console.log('Error', url, res.error);
        return;
      }
      if (res.body) {
        res.body = JSON.parse(res.body);
        table.push([_chalk2.default.blue(url), _chalk2.default.green(res.body.env), res.body.domains, res.body.version, _chalk2.default.green(res.body.statuses.phrases), res.body.statuses.phrasesLoaded, res.body.statuses.worker, res.body.statuses.iam, res.body.statuses.resources, res.body.statuses.assets, res.body.statuses.evci]);
      }
    }
    console.log(table.toString());
  });
};

module.exports = status;