#!/usr/bin/env node
process.bin = process.title = 'composr-cli'

import commandLineArgs from 'command-line-args'
import jsonfile from 'jsonfile'
import fs from 'fs'
import YAML from 'yamljs'
import inquirer from 'inquirer'
import prompt from 'prompt'
import path from 'path'
import spinner from 'simple-spinner'
// Lib modules
import login from './login'
import writeCredentials from './writeCredentials'
import status from './status'
import Publish from './publish'
import print from './print'

/**
 * CLI INITIALIZATION
 */
let cli = commandLineArgs([
  { name: 'publish', alias: 'p', type: Boolean },
  { name: 'init', alias: 'i', type: Boolean },
  { name: 'status', alias: 's', type: Boolean },
  { name: 'help', alias: 'h', type: String, defaultOption: true },
  { name: 'phrases', type: String, multiple: true },
  { name: 'version', alias: 'v', type: String },
  { name: 'environment', alias: 'e', type: String, multiple: true },
  { name: 'verbose', alias: 'b', type: Boolean },
  { name: 'generatePhrase', alias: 'g', type: Boolean}
])

let options = cli.parse()

switch (options) {
  case options.publish:
    print.ok('Publicar!!')
    break
  case options.init:
    print.ok('Iniciar!!')
    break
  case options.status:
    print.ok('Pedir status!!')
    break
  case options.generatePhrase:
    generatePhrase()
    break
  default:
    console.log(cli.getUsage())
}
/**
 * [getUserHome description]
 * @return {[type]} [description]
 */
let getUserHome = () => {
  return process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME']
}
/**
 * Credentials
 */
let ACCESS_TOKEN = null
let DOMAIN = null
  // CONST
const USER_HOME_ROOT = getUserHome() + '/.composr'
prompt.message = 'CompoSR'.cyan
prompt.delimiter = '><'.green

/**
 * [init description]
 * @return {[type]} [description]
 */
let init = () => {
  spinner.start()
  initRC((err, result) => {
    spinner.stop()
    if (err) print.error(err)
    locateComposrJson((err, result) => {
      if (err) print.error(err)
      print.ok('CompoSR ready to rock!')
    })
  })
}

/**
 * PUBLISH
 */
let publish = () => {
  spinner.start()
  initRC((err, result) => {
    if (err) print.error(err)
    locateComposrJson((err, config) => {
      if (err) return print.error(err)
      config.ACCESS_TOKEN = ACCESS_TOKEN
      Publish(config)
    })
  })
}

/**
 * Generate Phrase
 */
let generatePhrase = () => {
  spinner.start()

  inquirer.prompt([{
    type: 'input',
    name: 'name',
    message: 'Which name would you like for your endpoint?',
    default: 'My Endpoint'
  },{
    type: 'input',
    name: 'url',
    message: 'What is the URL of the endpoint?',
    default: ''
  },{
      type: 'checkbox',
      name: 'verbs',
      message: 'Which verbs will respond to?',
      choices: ['get', 'post', 'put', 'delete'],
      default: 1
    }], function(answers) {
      console.log(answers)
      if (!answers['name']){
        return print.error('Please choose a phrase name')
      }

      if (!answers['url']){
        return print.error('Please choose a phrase url')
      }

      if (!answers['verbs']){
        return print.error('Please select any verb')
      }
      //phraseGenerator(answers['name'], answers['url'], answers['verbs'])
  
  });
}

/**
 * Get environments status
 */
let getStatus = () => {
  locateComposrJson((err, obj) => {
    if (err) return print.error(err)
    let envStatus = obj.environments.map(url => {
      return url + '/status'
    })
    status(envStatus, spinner)
  })
}

/**
 * [locateComposrJson description]i
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
let locateComposrJson = next => {
  jsonfile.readFile(process.cwd() + '/composr.json', (err, obj) => {
    if (!err) {
      next(null, obj)
    } else {
      let schema = {
        properties: {
          name: {
            message: 'Your composr vdomain name',
            default: path.basename(process.cwd()),
            type: 'string'
          },
          subdomain: {
            message: 'Your Subdomain name',
            default: '',
            type: 'string'
          },
          baseUri: {
            message: 'Your composr vdomain url',
            default: 'https://api.example.com',
            type: 'string'
          },
          author: {
            message: 'Your name',
            default: path.basename(getUserHome()),
            type: 'string'
          },
          version: {
            message: 'Version',
            default: '1.0.0',
            type: 'string'
          },
          source_location: {
            message: 'Where is my phrases code?',
            default: 'src/',
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
          }
        }
      }

      prompt.start()
      prompt.get(schema, (err, result) => {
        if (err) print.error(err)
        result.vd_dependencies = {}
        result.domain = DOMAIN
        result.id = DOMAIN + '!' + result.name
        result.environments = []
          // creating composr.json
        fs.writeFile(process.cwd() + '/composr.json', JSON.stringify(result, null, 2), (err) => {
          if (err) return next(err, false)
          return next(null, true)
        })
      })
    }
  })
}

/**
 * initRC
 * @return next
 */
let initRC = next => {
  if (!fs.existsSync(USER_HOME_ROOT)) fs.mkdirSync(USER_HOME_ROOT)
  locateRc(next)
}

/**
 * [locateRc description]
 * @return {[type]} [description]
 */
let locateRc = next => {
  fs.readFile(USER_HOME_ROOT + '/.composrc', 'utf8', (err, credentialsYml) => {
    if (err) {
      // start prompt
      prompt.start()
        //
      prompt.get([{
        name: 'clientId',
        required: true,
        conform: (value) => {
          return true
        }
      }, {
        name: 'clientSecret',
        required: true,
        conform: (value) => {
          return true
        }
      }, {
        name: 'scopes',
        required: true,
        conform: (value) => {
          return true
        }
      }, {
        name: 'urlBase',
        required: true,
        conform: (value) => {
          return true
        }
      }], (err, result) => {
        if (err) return print.error(err)

        let credentials = {
          clientId: result.clientId || null,
          clientSecret: result.clientSecret || null,
          scopes: result.scopes || null,
          urlBase: result.urlBase || null
        }

        loginClient(credentials, next)
      })
    } else {
      loginClient(YAML.parse(credentialsYml), next)
    }
  })
}

/**
 * [login description]
 * @param  {[type]} credentials [description]
 * @return {[type]}             [description]
 */
let loginClient = (credentials, next) => {
  login(credentials, (err, creds, domain) => {
    if (err) {
      spinner.stop()
      print.error(err)
      return next(err, null)
    } else {
      spinner.stop()
      print.ok('Login successful')
      ACCESS_TOKEN = creds.access_token
      DOMAIN = domain
      return writeCredentials(USER_HOME_ROOT + '/.composrc', creds, next)
    }
  })
}

/**
 * uncaughtException handler
 */
process.on('uncaughtException', err => {
  print.error('Caught exception: ' + err)
})
