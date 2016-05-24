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

    let envExists = envList.find(item => item.name === options.env[0])

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
        goToBuild(answers['environment'], getUrlBase(answers['environment'], envList), config)
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
  print.ok('You have selected :' + process.env.ENV_ENDPOINT)
  // SignIn user to env
  login(config.credentials, (err, creds) => {
    if (err) return print.error(err)
    process.env.AT = creds.accessToken
    // Execution all tasks in serie
    build(config, (err, results) => {
      if (err) return print.error(err)
      print.ok('Sending stuff to your Composr server!')
      // console.log(JSON.stringify(results, null, 2))
      process.env.COUNT_PHRASES = results.phrases.length
      // Sending phrases list to composr
      Pub(results.phrases, (errors, results) => {
        if (!errors) print.ok('All publish tasks done!')
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
