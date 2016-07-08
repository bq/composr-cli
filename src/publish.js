'use strict'
/* cli modules */
import print from './print'
import build from './build'
import envs from './environments'
import Pub from './publisher'
import login from './login'
/* general modules */
import inquirer from 'inquirer'

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
  // Before build manage environments
  envs(config, (err, envList) => {
    if (err) print.error(err)

    let envExists = (options.env) ? envList.find(item => item.name === options.env[0]) : false

    if (options.env && envExists) {
      // Only get first environment passes throw cli args
      let selectedEnv = getUrlBase(options.env[0], envList)
      // Call to build phrases and snippets models
      config.credentials = selectedEnv.credentials
      goToBuild(selectedEnv.name, selectedEnv, config)
    } else {
      inquirer.prompt([{
        type: 'list',
        name: 'environment',
        message: 'Which environment do you want to choose?',
        choices: envList.map((m) => {
          return m.name
        }),
        default: 1
      }], (answers) => {
        let selectedEnv = getUrlBase(answers['environment'], envList)
        config.credentials = selectedEnv.credentials
        goToBuild(answers['environment'], selectedEnv, config)
      })
    }
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

/**
 * getUrlBase
 * @param  {String} selectedEnv
 * @param  {Array} envList
 * @return {String}
 */
const getUrlBase = (selectedEnv, envList) => {
  let currentEnv = null
  envList.forEach(e => {
    if (e.name === selectedEnv) currentEnv = e
  })
  return currentEnv
}

module.exports = Publish
