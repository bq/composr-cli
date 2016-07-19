/* general modules */
import inquirer from 'inquirer'
/**
 * Environments manager. Returns the list of environments.
 */

const envManager = (config,options, next) => {

    let envs = config.environments.map(env => {
        return {
            name: env.name,
            composrEndpoint: env.urlBase.replace('{{module}}', 'composr').replace('v1.0/', ''),
            credentials : {
            	clientId : env.clientId,
            	scopes : env.scopes,
            	urlBase: env.urlBase,
            	clientSecret: env.clientSecret
            }
        }
    })
    // Check cli env option
    let envExists = (options.env) ? envs.find(item => item.name === options.env[0]) : false

    if (options.env && envExists) {
      // Only get first environment passes throw cli args
      let selectedEnv = getUrlBase(options.env[0], envs)
      // Call to build phrases and snippets models
      config.credentials = selectedEnv.credentials
      return next(null, selectedEnv.name, selectedEnv, config)

    } else {

      inquirer.prompt([{
        type: 'list',
        name: 'environment',
        message: 'Which environment do you want to choose?',
        choices: envs.map((m) => {
          return m.name
        }),
        default: 1
      }], (answers) => {
        let selectedEnv = getUrlBase(answers['environment'], envs)
        config.credentials = selectedEnv.credentials
        next(null,answers['environment'], selectedEnv, config)
      })
    }
}

/**
 * getUrlBase
 * @param  {String} selectedEnv
 * @param  {Array} envs
 * @return {String}
 */
const getUrlBase = (selectedEnv, envs) => {
  let currentEnv = null
  envs.forEach(e => {
    if (e.name === selectedEnv) currentEnv = e
  })
  return currentEnv
}

module.exports = envManager
