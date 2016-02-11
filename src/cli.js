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
import findRaml from './findRaml'

// CONST
const USER_HOME_ROOT = getUserHome() + '/.composr'
prompt.message = "CompoSR".cyan
prompt.delimiter = "><".green


// CLI
cli.parse({
    init: ['i', 'Create a composr.json in your project.'],
    publish: ['p', 'Publish all your phrases to CompoSR'],
    update: ['u', 'Update at CompoSR.io your composr.json']
})

cli.main((args, options) => {
    /*cli.debug(JSON.stringify(options))
    cli.debug(args)*/
    if(options.init) init()
    if(options.publish) publish()
})


/**
 * [init description]
 * @return {[type]} [description]
 */
function init() {

    initRC((err, result) => {
        locateComposrJson((err, result) => {
            console.log('CompoSR ready to rock!')
        })
    })
}


function publish(){
  locateComposrJson((err,json) => {
    if(!err) return findRaml(json)
    cli.error('Cannot locate composr.json, please generate new one with composr-cli --init')
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
            next(null, obj)
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

    locateRc(next)
}

/**
 * [locateRc description]
 * @return {[type]} [description]
 */
function locateRc(next) {

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
function loginClient(credentials, next) {

    login(credenials, function(err, creds){
      if(err){
        cli.error(err)
        return next(err, null)
      }else{
        cli.ok('Login successful');
        return writeCredentials(USER_HOME_ROOT + '/.composrc', creds, next);
      }
    });
}

/**
 * [getUserHome description]
 * @return {[type]} [description]
 */
function getUserHome() {
    return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME']
}
