import print from './print'
import Login from './login'
import Env from './environments'

import request from 'request'
import _ from 'lodash'


function Unpublisher(config, options) {
  // Get environment configuration
  Env(config, options, (err, envName, selectedEnv, _config) => {
    if (err) print.error(err)
    // Authorize user to this environment
    Login(selectedEnv.credentials, (err, creds, domain) => {
      if (err) print.error(err)
      process.env.ACCESS_TOKEN = creds.accessToken
      console.log([null, creds.accessToken, domain])
      _getEnvironmentPhrases(selectedEnv, options)
    })
  })
}


const _getEnvironmentPhrases = (selectedEnv, options) => {
  request({
    url: selectedEnv.composrEndpoint + 'phrase',
    headers: {
      'Authorization': 'Bearer ' + process.env.ACCESS_TOKEN
    },
    method: 'GET',
    json : true
  }, (err, response, body) => {

    if (err) print.error(err)

    if (response.statusCode === 401) {

      print.error(response.statusCode)

    } else {
      if(body.length > 0){
        _modelizePhraseResponse(body, options)
      }else{
        print.info('no phrases found on this environment')
      }

    }
  })
}

const _modelizePhraseResponse = (phrasesList, options) => {

  let versions = []

  let phrasesObjects = phrasesList.map((p) => {
    let _ver = p.id.slice(-5)
    versions.push(_ver)
    return { id : p.id, domain: p.domain, version: _ver }
  })
  versions = _.uniq(versions)
  //console.log(phrasesObjects)
  console.log('VERSIONES')
  console.log(versions)
  if(options.version && (versions.indexOf(options.version) !== -1)){
    phrasesObjects = phrasesObjects.filter((p) => {
      return (p.version === options.version)
    })
    console.log(phrasesObjects)
  }else{
    print.error('no version specified, please use --version=X.X.X')
  }
}

module.exports = Unpublisher
