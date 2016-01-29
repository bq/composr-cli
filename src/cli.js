process.bin = process.title = 'composr-cli'

import cli from 'cli'
import jsonfile from 'jsonfile'
import util from 'util'
import fs from 'fs'
import YAML from 'yamljs'
import prompt from 'prompt'
import async from 'async'
import corbel from 'corbel-js'


cli.parse({
    init: ['i', 'Create a composr.json in your project.'],
    publish: ['p', 'Publish all your phrases to CompoSR'],
    update: ['u', 'Update at CompoSR.io your composr.json']
})

cli.main((args, options) => {
    // cli.debug(JSON.stringify(options))
    // cli.debug(args)
    if (options.init) init()
})


/**
 * [init description]
 * @return {[type]} [description]
 */
function init() {

    //async.series()
    locateRc()
}

/**
 * [locateComposrJson description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
function locateComposrJson(next) {

    const file = process.cwd() + '/composr.json'

    jsonfile.readFile(file, function(err, obj) {
        if (!err) {
            console.dir(obj)
        } else {
            cli.error('Json not found')
        }
    })
}

/**
 * [locateRc description]
 * @return {[type]} [description]
 */
function locateRc() {


    fs.readFile(process.cwd() + '/.composrc', 'utf8', (err, credentialsYml) => {

        if (err) {

            prompt.message = "cpo!".cyan
            prompt.delimiter = "><".green
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

                login(credentials)
            })

        } else {
            login(YAML.parse(credentialsYml))
        }
    })
}

/**
 * [login description]
 * @param  {[type]} credentials [description]
 * @return {[type]}             [description]
 */
function login(credentials) {


      const corbelDriver = corbel.getDriver(credentials)

      corbelDriver.iam.token().create().then(response => {

          credentials.accessToken = response.data.accessToken

          let yamlString = YAML.stringify(credentials, 4);

          fs.writeFile(process.cwd() + '/.composrc', yamlString, (err) => {
              if (err) throw err

              fs.appendFile(process.cwd() + '/.gitignore', '.composrc \n', (err) => {
                  if (err) throw err
              })

              cli.ok('.composrc created successfully!')

          })

          cli.ok('Login successfully:')

      }).catch((err) => {
          cli.error(err)
      })

}
