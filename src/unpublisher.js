import print from './print'
import Login from './login'
import Env from './environments'

import rp from 'request-promise'
import _ from 'lodash'
import Table from 'cli-table'
import co from 'co'


function Unpublisher(config, options) {
  // Get environment configuration
  Env(config, options, (err, envName, selectedEnv, _config) => {
    if (err) print.error(err)
      // Authorize user to this environment
    Login(selectedEnv.credentials, (err, creds, domain) => {
      if (err) print.error(err)
      process.env.ACCESS_TOKEN = creds.accessToken
      process.env.CP_URL = selectedEnv.composrEndpoint
        //console.log([null, creds.accessToken, domain])
      _getEnvironmentPhrases(selectedEnv, options)
    })
  })
}


const _getEnvironmentPhrases = (selectedEnv, options) => {
  rp({
    url: selectedEnv.composrEndpoint + 'phrase',
    headers: {
      'Authorization': 'Bearer ' + process.env.ACCESS_TOKEN
    },
    method: 'GET',
    json: true
  }).then((body) => {

    (body.length > 0) ? _modelizePhraseResponse(body, options): print.info('no phrases found on this environment')

  }).catch((err) => {
    print.error(err)
  })
}

const _modelizePhraseResponse = (phrasesList, options) => {

  let versions = []

  let phrasesObjects = phrasesList.map((p) => {
    let _ver = p.id.slice(-5)
    versions.push(_ver)
    return {
      id: p.id,
      domain: p.domain,
      version: _ver
    }
  })
  versions = _.uniq(versions)
    //console.log(phrasesObjects)
  print.info('Phrase versions availables: ')

  let table = new Table({
    head: ['Version'],
    colWidths: [30]
  })
  versions.map((v) => {
      table.push([v])
    })
    // Show table
  console.log(table.toString())

  if (options.version && (versions.indexOf(options.version) !== -1)) {
    phrasesObjects = phrasesObjects.filter((p) => {
      return (p.version === options.version)
    })

    //console.log(phrasesObjects)

    let deleteCalls = []
    let versionToDelete

    phrasesObjects.forEach((p) => {
      versionToDelete = p.version
      deleteCalls.push(rp({
        url: process.env.CP_URL + 'phrase/' + p.id,
        headers: {
          'Authorization': 'Bearer ' + process.env.ACCESS_TOKEN
        },
        method: 'DELETE',
        json: true
      }))
    })

    // Call to unpublish
    _unpublish(deleteCalls, versionToDelete)

  } else {
    print.error('wrong version specified, please use --version=X.X.X')
  }
}

/**
 * Unpublish method with co-routines
 */
function _unpublish(deleteCalls, versionToDelete){
  co(function*() {
    let res = yield deleteCalls
    print.ok('All ' + versionToDelete + ' phrases and snippets removed')
  }).catch(onerror)
}

function onerror(err){
  print.error(err)
}

module.exports = Unpublisher
