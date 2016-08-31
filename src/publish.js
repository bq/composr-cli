'use strict'
/* cli modules */
import print from './print'
import build from './build'
import envs from './environments'
import Pub from './publisher'
import login from './login'

/**
 * Publish Module Entry
 * @param  {Object} config
 * @param  {Object} options
 * @return {void}
 */
const Publish = (config, options) => {
  if (options.force) {
    config.force = true
  }

  // Set phrases and snippets version
  process.env.PROJECT_VERSION = options.version ? options.version : config.version
  // Before build manage environments
  envs(config, options, (err, envName, selectedEnv, _config) => {
    if (err) print.error(err)
    goToBuild(envName, selectedEnv, _config)
  })
}

/**
 * goToBuild
 * @param  {String} envName
 * @param  {String} envData
 * @param  {Object} config
 * @return {void}
 */
const goToBuild = (envName, envData, config) => {
  // Environment selected
  process.env.NODE_ENV = envName
  process.env.ENV_ENDPOINT = envData.composrEndpoint
  print.info('You have selected :' + process.env.ENV_ENDPOINT)
  // SignIn user to env
  login(config.credentials, (err, creds) => {
    if (err) return print.error(err)
    process.env.AT = creds.accessToken
    // Execution all tasks in serie
    build(config, (err, data) => {
      if (err) return print.error(err)
      print.info('Uploading stuff to your Composr...')
      // console.log(JSON.stringify(data, null, 2))
      process.env.COUNT_PHRASES = data.phrases.length
      // Sending phrases list to composr
      Pub('phrase',data.phrases, (errors, _pResults) => {
        if (errors) print.error(errors)
        Pub('snippet', data.snippets, (errors, _pResults) => {
          if (!errors) print.info('All publish tasks done!')
        })
      })
    })
  })
}

module.exports = Publish
