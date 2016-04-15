#!/usr/bin/env node

process.bin = process.title = 'composr-cli'

import commandLineArgs from 'command-line-args'
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
import Build from './build'
import print from './print'
import generator from './generators/cli-ui'
import art from 'ascii-art'

/**
 * [getUserHome description]
 * @return {[type]} [description]
 */
let getUserHome = () => {
    return process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME']
}
  // CONST
const USER_HOME_ROOT = getUserHome() + '/.composr'
prompt.message = 'CompoSR'.cyan
prompt.delimiter = '><'.green

/**
 * [init description]
 * @return {[type]} [description]
 */
let init = (options) => {
    //spinner.start()
    initRC((err, result) => {
      //spinner.stop()
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
let publish = (options) => {
  //spinner.start()
  initRC((err, result) => {
    if (err) print.error(err)
    locateComposrJson((err, config) => {
      if (err) return print.error(err)
      Publish(config, options)
    })
  })
}

/**
 * Build
 */
let build = () => {
  locateComposrJson((err, config) => {
    if (err) return print.error(err)
    Build(config, function(err, results){
      console.log(results)
    })
  })
}

/**
 * Get environments status
 */
let getStatus = (options) => {
  locateComposrJson((err, obj) => {
    if (err) return print.error(err)
    if (obj.environments && Array.isArray(obj.environments)) {
      let envStatus = obj.environments.map(env => {
        let status_ = '/status'
        let urlBase = env.urlBase.replace('{{module}}/v1.0/', 'composr')
        if (urlBase.slice(-1) === '/') {
          status_ = 'status'
        }
        return (urlBase + status_)
      })
      status(envStatus, spinner)
    } else {
      print.info('Unable to find valid environments properties in your local composr.json')
    }
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
        print.error(err)
        return next(err, null)
      } else {
        print.ok('Credentials verified... OK')
        return writeCredentials(USER_HOME_ROOT + '/.composrc', creds, next)
      }
    })
  }
  
function startCommandLine(){
  /**
   * ------------------
   * CLI INITIALIZATION
   * ------------------
   */
  let cli = commandLineArgs([{
    name: 'publish',
    alias: 'p',
    type: Boolean
  }, {
    name: 'init',
    alias: 'i',
    type: Boolean
  }, {
    name: 'status',
    alias: 's',
    type: Boolean
  }, {
    name: 'generate',
    alias: 'g',
    type: Boolean,
    defaultOption: false
  }, {
    name: 'help',
    alias: 'h',
    type: String,
    defaultOption: true
  }, {
    name: 'phrases',
    type: String,
    multiple: true
  }, {
    name: 'version',
    alias: 'v',
    type: String
  }, {
    name: 'env',
    alias: 'e',
    type: String,
    multiple: true
  }, {
    name: 'verbose',
    alias: 'd',
    type: Boolean
  }, {
    name: 'build',
    alias: 'b',
    type: Boolean
  },
  {
    name: 'force',
    alias: 'f',
    type: Boolean
  }])

  let options = cli.parse()
  console.log(options)

  if (options.init === true) {
    print.ok('Initialization ...')
    init(options)
  } else if (options.build === true) {
    print.ok('Building definitions ...')
    build(options)
  } else if (options.publish === true) {
    print.ok('Publish Loading ...')
    publish(options)
  } else if (options.status === true) {
    print.ok('Loading environments status ...')
    getStatus(options)
  } else if (options.generate === true) {
    print.ok('Launching generator ...')
    locateComposrJson((err, config) => {
      if (err) return print.error(err)
      generator(config)
    })
  } else if (options.help === true) {
    cli.getUsage()
  } else {
    salute();
  }

  /**
   * uncaughtException handler
   */
  process.on('uncaughtException', err => {
    print.error('Caught exception: ' + err)
  })
}

let salute() => {
  art.font('Composr', 'Doom', 'bright_green', function (rendered) {
    console.log(rendered)
    console.dir({
      version : '0.5.0',
      madeby : 'BQ'
    })
  })
}


module.exports = {
  cli : startCommandLine,
  build : build
}