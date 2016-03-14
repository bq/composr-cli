process.bin = process.title = 'composr-cli'

import cli from 'cli'
import jsonfile from 'jsonfile'
import fs from 'fs'
import YAML from 'yamljs'
import prompt from 'prompt'
import path from 'path'

// Lib modules
import login from './login'
import writeCredentials from './writeCredentials'
//import findRaml from './findRaml'
import apiDoc from './generateDoc'
import parseRaml from './parseRaml'
//utils
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
  initRC((err, result) => {
    if (err) console.log(err)
    locateComposrJson((err, result) => {
      if (err) console.log(err)
      locateApiRaml(result, (err, result) => {
        if (err) cli.error(err)
        cli.ok('CompoSR ready to rock!')
      })
    })
  })
}
/**
 * PUBLISH
 */
let publish = () => {
  locateComposrJson((err, json) => {
    // call to parse raml
    if (!err) return parseRaml(true, json, (lintErrors, result) => {
        // List erros from linter
        if (lintErrors && Array.isArray(lintErrors)) {
          for (var i = 0; i < lintErrors.length; i++) {
            cli.error(JSON.stringify(lintErrors[i], null, 2))
          }
        } else if (typeof lintErrors === 'string') {
          cli.error(lintErrors)
        } else {
          cli.ok('created .composr')
        }
      })
    return cli.error('Cannot locate composr.json, please generate new one with composr-cli --init')
  })
}
/**
 * Generate Doc
 */
let generateDoc = () => {
  // First of all, locate composr.json to get configuration
  locateComposrJson((err, json) => {
    cli.ok('composr.js located')
    // Locating api.raml file
    if (!err) {
      return locateApiRaml(json, (err, result) => {
        if (err) return cli.error(err)
        // Call to apiDoc to generate documentation
        apiDoc(json, (err, result) => {
          if (err) return cli.error(err)
          cli.ok('API Documentation generated!')
        })
      })
    }
    cli.error('Cannot locate composr.json, please generate new one with composr-cli --init')
  })
}

let convertYaml = () => {
  let naviteObj = YAML.load('api.raml')
  console.log(JSON.stringify(naviteObj, null, 2))
}

/**
 * [locateComposrJson description]i
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
let locateComposrJson = next => {
  jsonfile.readFile(process.cwd() + '/composr.json', (err, obj) => {
    if (!err) {
      cli.ok(':: Your Initialization is done ::')
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
          },
          mock_middleware: {
            message: 'Do you want activate mock middleware?',
            default: false,
            type: 'boolean'
          },
          validate_middleware: {
            message: 'Do you want activate validate middleware?',
            default: false,
            type: 'boolean'
          },
          api_raml_location: {
            message: 'What is the name of your api.raml?',
            default: 'api.raml',
            type: 'string'
          }
        }
      }

      prompt.start()
      prompt.get(schema, (err, result) => {
        if (err) cli.error(err)
        result.vd_dependencies = {}
        result.doc_folder = 'doc/'
        result.domain = DOMAIN
        result.id = DOMAIN + '!' + result.name
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
 * Locate Api Raml, if not exists create new one
 */
let locateApiRaml = (config, next) => {
  fs.access(process.cwd() + '/API.raml', fs.R_OK | fs.W_OK, (err) => {
    if (!err) return next()

    let header = '#%RAML 0.8 \n' +
      'title: ' + config.title + '\n' +
      'version: ' + config.version + '\n' +
      'baseUri: ' + config.baseUri + '\n' +
      'mediaType: application/json'

    // creating API.raml
    fs.writeFile(process.cwd() + '/API.raml', header, (err) => {
      if (err) {
        return next(err, false)
      }
      return next(null, true)
    })
  })
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
  yaml: ['y', 'Yaml Conversion']
})

cli.main((args, options) => {
  /* cli.debug(JSON.stringify(options))
  cli.debug(args)*/
  if (options.init) init()
  if (options.publish) publish()
  if (options.doc) generateDoc()
  if (options.yaml) convertYaml()
})
/**
 * uncaughtException handler
 */
process.on('uncaughtException', err => {
  cli.error('Caught exception: ' + err)
})
