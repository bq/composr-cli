'use strict'
/* cli modules */
import print from './print'
import build from './build'
import envs from './environments'
import Pub from './publisher'
import login from './login'
<<<<<<< HEAD
import inquirer from 'inquirer'
=======
>>>>>>> 2d2f09b1850f87ce5b0a4ab1bbfd4debc50552b2

/**
 * Publish Module Entry
 * @param  {Object} config
 * @param  {Object} options
 * @return {void}
 */
const Publish = (config, options) => {
  if (options.force) {
    config.force = true
  }

  // Set phrases and snippets version
  process.env.PROJECT_VERSION = options.version ? options.version : config.version
  // Before build manage environments
  envs(config, options, (err, envName, selectedEnv, _config) => {
    if (err) print.error(err)
    var publishSingle = options.isSingle || null;
    // (health(selectedEnv.urlBase)) ? goToBuild(envName, selectedEnv, _config) : print.error('Environment not available')
    goToBuild(envName, selectedEnv, _config, publishSingle)
  })
}

/**
 * goToBuild
 * @param  {String} envName
 * @param  {String} envData
 * @param  {Object} config
 * @return {void}
 */
const goToBuild = (envName, envData, config, publishSingle) => {
  // Environment selected
  process.env.NODE_ENV = envName
  process.env.ENV_ENDPOINT = envData.composrEndpoint
  print.info('You have selected :' + process.env.ENV_ENDPOINT)
  // SignIn user to env
  login(config.credentials, (err, creds) => {
    if (err) return print.error(err)
    process.env.AT = creds.accessToken
    // Execution all tasks in serie
    build(config, (err, data) => {
      if (err) return print.error(err)

      print.info('Uploading stuff to your Composr...')

      process.env.COUNT_PHRASES = data.phrases.length
      if (publishSingle) {
        // data.phrases = getSinglePhrases(data);
        getSinglePhrases(data, (err, selectedPhrases) => {
          data.phrases = selectedPhrases;
          getSingleSnippets(data, (err, selectedSnippets) => {
            data.snippets = selectedSnippets;
            publish(data.phrases, data.snippets);
          });
        });
      } else {
        publish(data.phrases, data.snippets);
      }
    })
  })
}

const publish = (phrases, snippets) => {
  // Sending phrases list to composr
  if (phrases.length) {
    Pub('phrase', phrases, (errors, _pResults) => {
      if (errors) print.error(errors)
      if (snippets.length) {
        Pub('snippet', snippets, (errors, _pResults) => {
          if (!errors) print.info('All publish tasks done!');
        })
      } else {
        print.info('All publish tasks done!');
      }
    })
  } else if (snippets.length) {
    Pub('snippet', snippets, (errors, _pResults) => {
      if (!errors) print.info('All publish tasks done!');
    })
  } else {
    print.info('No phrases/snippets selected, task done!')
  }
}

const getSinglePhrases = (data, cb) => {
  // Show assistant 
  // Remove duplicated phrases
  var selectedPhrases = [];
  var phrasesCreatedNoDup = data.phrases.reduce(function(previous, el) {
    var existsElement = previous.find(function(e) {
      return e.__meta.modelPath === el.__meta.modelPath;
    });
    if (!existsElement) previous.push(el);
    return previous;
  }, []);
  var phrasesChoices = phrasesCreatedNoDup.map(function(e) {
    return {
      name: e.url,
      value: e.url
    };
  });

  inquirer.prompt([{
    type: 'checkbox',
    name: 'phrases',
    message: 'Which phrases do you want to publish?',
    choices: phrasesChoices
  }], function(answers) {
    answers.phrases.forEach(function(t) {
      var selected = data.phrases.filter(function(e) {
        return e.url === t;
      });
      selectedPhrases = selectedPhrases.concat(selected);
    });
    cb(null, selectedPhrases);
  });
}

const getSingleSnippets = (data, cb) => {
  // Show assistant 
  // Remove duplicated phrases.
  var selectedSnippets = [];
  var snippetsChoices = data.snippets.map(function(e) {
    return {
      name: e.name,
      value: e.name
    };
  });
  inquirer.prompt([{
    type: 'checkbox',
    name: 'snippets',
    message: 'Which snippets do you want to publish?',
    choices: snippetsChoices
  }], function(answers) {
    answers.snippets.forEach(function(t) {
      var selected = data.snippets.filter(function(e) {
        return e.name === t;
      });
      selectedSnippets = selectedSnippets.concat(selected);
    });
    cb(null, selectedSnippets);
  });
}

module.exports = Publish
