'use strict'

import corbel from 'corbel-js'
import print from './print'
/**
 * [login description]
 * @param  {[type]} credentials [description]
 * @return {[type]}             [description]
 */
let login = (credentials, next) => {

  const corbelDriver = corbel.getDriver(credentials)
  corbelDriver.iam
    .token()
    .create()
    .then(response => {
      credentials.accessToken = response.data.accessToken
      let domain = corbel.jwt.decode(response.data.accessToken).domainId
      print.info('Logged successfully to domain: '+ domain)
      return next(null, credentials, corbel.jwt.decode(credentials.accessToken).domainId)
    }).catch((err) => {
      return next(err, null)
    })
}

module.exports = login
