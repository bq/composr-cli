'use strict';

var _corbelJs = require('corbel-js');

var _corbelJs2 = _interopRequireDefault(_corbelJs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * [login description]
 * @param  {[type]} credentials [description]
 * @return {[type]}             [description]
 */
function login(credentials, next) {

  var corbelDriver = _corbelJs2.default.getDriver(credentials);

  corbelDriver.iam.token().create().then(function (response) {
    credentials.accessToken = response.data.accessToken;
    return next(null, credentials);
  }).catch(function (err) {
    return next(err, null);
  });
}

module.exports = login;