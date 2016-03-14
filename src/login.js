'use strict'

import corbel from 'corbel-js'
/**
 * [login description]
 * @param  {[type]} credentials [description]
 * @return {[type]}             [description]
 */
function login(credentials, next) {

  const corbelDriver = corbel.getDriver(credentials)

  corbelDriver.iam
    .token()
    .create()
    .then(response => {
      credentials.accessToken = response.data.accessToken

      return next(null, credentials, corbel.jwt.decode(credentials.accessToken).domainId)
    }).catch((err) => {
      return next(err, null)
    })
}

module.exports = login
