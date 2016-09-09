import print from './print'
import Login from './login'
import Env from './environments'

import rp from 'request-promise'
import _ from 'lodash'
import Table from 'cli-table'
import co from 'co'
import inquirer from 'inquirer'


function Unpublisher(config, options) {
  // Get environment configuration
  Env(config, options, (err, envName, selectedEnv, _config) => {
    if (err) print.error(err)
      // Authorize user to this environment
    Login(selectedEnv.credentials, (err, creds, domain) => {
      if (err) print.error(err)
      process.env.ACCESS_TOKEN = creds.accessToken
      process.env.CP_URL = selectedEnv.composrEndpoint
      _getEnvironmentPhrasesSnippets(selectedEnv, options)
        .then(function(data) {
          _modelizePhraseResponse(data, options);
        });
    })
  })
}


const _getEnvironmentPhrasesSnippets = (selectedEnv, options) => {
  var envData = [];
  return getItemBy(selectedEnv, 'phrase')
    .then((data) => {
      envData = envData.concat(data);
      return getItemBy(selectedEnv, 'snippet');
    })
    .then((data) => {
      envData = envData.concat(data);
      return envData;
    }).catch((err) => {
      print.error(err)
    })
}

const getItemBy = (selectedEnv, type) => {
  return rp({
      url: selectedEnv.composrEndpoint + type,
      headers: {
        'Authorization': 'Bearer ' + process.env.ACCESS_TOKEN
      },
      method: 'GET',
      json: true
    })
    .then((data) => {
      if (!Array.isArray(data)) {
        print.warning('No phrases returned')
        return [];
      }
      return data.map(function(e) {
        e.type = type;
        return e;
      });
    })
}

const _modelizePhraseResponse = (phrasesList, options) => {

  let versions = []

  let phrasesObjects = phrasesList.map((p) => {
    versions.push(p.json.version)
    return {
      id: p.id,
      domain: p.domain,
      version: p.json.version,
      type: p.type
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

    // console.log(phrasesObjects)

    let deleteCalls = []
    let versionToDelete = options.version

    if (options.isSingle) {
      getSingleItem(phrasesObjects, (err, selectedPhrases) => {
        phrasesObjects = selectedPhrases;
        deleteCalls = createDeleteRequests(phrasesObjects);
        _unpublish(deleteCalls, versionToDelete)
      });
    } else {
      deleteCalls = createDeleteRequests(phrasesObjects);
      // Call to unpublish
      _unpublish(deleteCalls, versionToDelete)
    }
  } else {
    print.error('wrong version specified, please use --version=X.X.X')
  }
}

function createDeleteRequests(phrasesObjects) {
  var deleteCalls = [];

  phrasesObjects.forEach((p) => {
    deleteCalls.push(rp({
      url: process.env.CP_URL + p.type + '/' + p.id,
      headers: {
        'Authorization': 'Bearer ' + process.env.ACCESS_TOKEN
      },
      method: 'DELETE',
      json: true
    }))
  })
  return deleteCalls;
}

/**
 * Unpublish method with co-routines
 */
function _unpublish(deleteCalls, versionToDelete) {
  co(function * () {
    let res = yield deleteCalls
    print.ok('All ' + versionToDelete + ' phrases and snippets removed')
  }).catch(onerror);
}

function onerror(err) {
  print.error(err)
}

const getSingleItem = (data, cb) => {
  // Show assistant 
  // Remove duplicated phrases
  var selectedPhrases = [];
  var phrasesChoices = data.map(function(e) {
    return {
      name: e.id,
      value: e.id
    };
  });

  inquirer.prompt([{
    type: 'checkbox',
    name: 'phrases',
    message: 'Which phrases do you want to publish?',
    choices: phrasesChoices
  }], function(answers) {
    answers.phrases.forEach(function(t) {
      var selected = data.filter(function(e) {
        return e.id === t;
      });
      selectedPhrases = selectedPhrases.concat(selected);
    });
    cb(null, selectedPhrases);
  });
}

module.exports = Unpublisher