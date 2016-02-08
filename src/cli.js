process.bin = process.title = 'composr-cli'

import cli from 'cli'
import jsonfile from 'jsonfile'
import util from 'util'
import fs from 'fs'
import YAML from 'yamljs'
import prompt from 'prompt'
import async from 'async'
import corbel from 'corbel-js'
import path from 'path'

//Lib modules
import login from './login'
import writeCredentials from './writeCredentials'

// CONST
const USER_HOME_ROOT = getUserHome() + '/.composr'
const COMPOSR_RC_FILE_PATH = USER_HOME_ROOT + '/.composrrc'

prompt.message = "CompoSR".cyan
prompt.delimiter = " - ".green


// CLI
cli.parse({
  init: ['i', 'Create a composr.json in your project.'],
  publish: ['p', 'Publish all your phrases to CompoSR'],
  update: ['u', 'Update at CompoSR.io your composr.json']
})

cli.main((args, options) => {
    /*cli.debug(JSON.stringify(options))
    cli.debug(args)*/
    cli.ok('Welcome to CompoSR');
    if (options.init) {
      cli.debug('>>> Bootstraping a new CompoSR application')
      init()
    }else if(options.publish){
      cli.debug('>>> You are going to publish your endpoints')
    }else if(options.update){
      cli.debug('>>> Your XXXX are going to be updated in 10 seconds')
    }
})


/**
 * [init description]
 * @return {[type]} [description]
 */
function init() {
  initRC((err, result) => {
    locateComposrJson((err, result) => {
      cli.ok('CompoSR ready to rock!')
    })
  })
}

/**
 * [locateComposrJson description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
function locateComposrJson(next) {

    jsonfile.readFile(process.cwd() + '/composr.json', function(err, obj) {
        if (!err) {
            cli.ok(':: Your Initialization is done ::')
            cli.info('U can use CPO ^^')
            next(null, true)
        } else {

            let schema = {
                properties: {
                    name: {
                        message: 'Your composr vdomain name',
                        default: path.basename(process.cwd()),
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
                        default: './src',
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
                    }
                }
            }


            prompt.start()
            prompt.get(schema, (err, result) => {

                result.vd_dependencies = {}

                // creating composr.json
                fs.writeFile(process.cwd() + '/composr.json', JSON.stringify(result,null,2), (err) => {
                    if (err) {
                        return next(err, false)
                        throw err
                    }

                    return next(null, true)

                })
            })
        }
    })
}

function initRC(next) {

  if (!fs.existsSync(USER_HOME_ROOT)) fs.mkdirSync(USER_HOME_ROOT)

  getUserCredentials(function(err, credentials){
    if(err){
      return next(err, null);
    }else{
      return loginClient(credentials, next)
    }
  })
}

/**
 * [locateRc description]
 * @return {[type]} [description]
 */
function getUserCredentials(next) {

    fs.readFile(COMPOSR_RC_FILE_PATH, 'utf8', (err, credentialsYml) => {
        if (err) {
          cli.info('We were unable to find your CompoSR credentials, please enter them to continue:')

          askForCredentials((err, credentials) =>{
            if(err){
              next(err, null);
            }else{
              next(null, credentials)
            }
          });

        } else {
          next(null, YAML.parse(credentialsYml))
        }
    })
}

function askForCredentials(next){
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

    let credentials = {
      clientId: result.clientId || null,
      clientSecret: result.clientSecret || null,
      scopes: result.scopes || null,
      urlBase: result.urlBase || null
    }

    next(err, credentials);
  })
}

/**
 * [login description]
 * @param  {[type]} credentials [description]
 * @return {[type]}             [description]
 */
function loginClient(credentials, next) {

    login(credentials, function(err, creds){
      if(err){
        cli.error(JSON.stringify(err, null, 2))
        return next(err, null)
      }else{
        cli.ok('Login successful');
        return writeCredentials(COMPOSR_RC_FILE_PATH, creds, next);
      }  
    });
}

/**
 * [getUserHome description]
 * @return {[type]} [description]
 */
function getUserHome() {
  return process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME']
}