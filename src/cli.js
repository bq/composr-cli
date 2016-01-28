process.bin = process.title = 'composr-cli'

import cli from 'cli'
import jsonfile from 'jsonfile'
import util from 'util'
import fs from 'fs'
import YAML from 'yamljs'
import prompt from 'prompt'
import async from 'async'
import corbel from 'corbel-js'



/*let i = 0, interval = setInterval(function () {
      cli.progress(++i / 100);
      if (i === 100) {
          clearInterval(interval);
          cli.ok('Finished!');
      }
  }, 50);*/

cli.parse({
    init: ['i', 'Create a composr.json in your project.'],
    publish: ['p', 'Publish all your phrases to CompoSR'],
    update: ['u', 'Update at CompoSR.io your composr.json']
})

cli.main((args, options) => {
    cli.debug(JSON.stringify(options))
    cli.debug(args)
    if (options.init) init()
})



function init() {

    //async.series()
    locateRc()
}

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


function locateRc() {

    /*
    "corbel.composr.credentials": {
        "clientId": "9bdbd5c5",
        "clientSecret": "34f848098c9f79e3b675154add9cc6aa7d06625f85a531568ef930be98c83aab",
        "scopes": "composr:comp:admin"
    },
    "corbel.driver.options": {
        "urlBase": "https://proxy-next.bqws.io/{{module}}/v1.0/"
    },

    'clientSecret','scopes','urlBase'
     */

    fs.readFile(process.cwd() + '/.composrc', 'utf8', (err, data) => {

        if (err) {

            prompt.message = "CompoSR-cli!".cyan
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

                let yamlString = YAML.stringify(credentials, 4);

                fs.writeFile(process.cwd() + '/.composrc',yamlString, (err) => {
                  if(err) throw err

                  fs.appendFile(process.cwd()+'/.gitignore','.composrc', (err) => {
                    if(err) throw err
                  })

                  cli.ok('.composrc created successfully!')

                })

                login(credentials)
            })

        }else{
          return cli.ok('.composrc found!')
        }




    })

}


function login(credentials){

  const corbelDriver = corbel.getDriver(credentials)

  corbelDriver.iam.token().create().then(userTokens => {

    cli.ok('Login successfully:')
    cli.info(JSON.stringify(userTokens))

  }).catch((err) => {
    cli.error(err)
  })

}
