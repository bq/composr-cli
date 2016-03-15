process.bin = process.title = 'composr-cli'

import cli from 'cli'
import jsonfile from 'jsonfile'
import fs from 'fs'
import YAML from 'yamljs'
import prompt from 'prompt'
import path from 'path'
import spinner from 'simple-spinner'
// Lib modules
import login from './login'
import writeCredentials from './writeCredentials'
import status from './status'
import Publish from './publish'

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
    if (err) cli.error(err)
    locateComposrJson((err, result) => {
      if (err) cli.error(err)
      cli.ok('CompoSR ready to rock!')
    })
  })
}
  /**
   * PUBLISH
   */
let publish = () => {
  spinner.start()
  locateComposrJson((err, json) => {
    spinner.stop()
    if (err) return cli.error(err)
    Publish(spinner, cli)
  })
}

/**
 * Get environments status
 */
let getStatus = () => {
  locateComposrJson((err, obj) => {
    if (err) return cli.error(err)
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
        if (err) cli.error(err)
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
        if (err) return cli.error(err)

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
      cli.error(err)
      return next(err, null)
    } else {
      cli.ok('Login successful')
      ACCESS_TOKEN = creds.access_token
      DOMAIN = domain
      return writeCredentials(USER_HOME_ROOT + '/.composrc', creds, next)
    }
  })
}
// CLI
cli.parse({
  init: ['i', 'Create a composr.json in your project.'],
  publish: ['p', 'Publish all your phrases to CompoSR'],
  update: ['u', 'Update at CompoSR.io your composr.json'],
  doc: ['d', 'Generate API documentation'],
  status: ['s', 'Get Your CompoSR Project environments status']
})

cli.main((args, options) => {
  /* cli.debug(JSON.stringify(options))
  cli.debug(args)*/
  if (options.init) init()
  if (options.publish) publish()
  if (options.status) getStatus()
})
/**
 * uncaughtException handler
 */
process.on('uncaughtException', err => {
  cli.error('Caught exception: ' + err)
})
