'use strict'
import inquirer from 'inquirer'
import genPhrase from './phrase'
import genSnippet from './snippet'
import print from '../print'

let generatorWithQuestions = (config) => {
  inquirer.prompt([{
      type: 'list',
      name: 'type',
      message: 'What do you want to create?',
      choices: [{
        name : 'A new endpoint (Phrase)',
        value : 'phrase'
      },{
        name: 'A snippet of code',
        value: 'snippet'
      }],
      default: 1
    }], (answers) => {
      switch(answers['type']){
        case 'phrase' :
          generatePhrase(config.source_location + '/phrases');
          break;
        case 'snippet':
          generateSnippet(config.source_location + '/snippets');
          break;
      }
    })
}

/**
 * Generate Phrase
 */
// phraseGenerator(answers['name'], answers['url'], answers['verbs'])
let generatePhrase = (sourceLocation) => {
    inquirer.prompt([{
      type: 'input',
      name: 'name',
      message: 'Which name would you like for your endpoint?',
      default: 'My Endpoint'
    }, {
      type: 'input',
      name: 'url',
      message: 'What is the URL of the endpoint?',
      default: ''
    }, {
      type: 'checkbox',
      name: 'verbs',
      message: 'Which verbs will respond to?',
      choices: ['get', 'post', 'put', 'delete'],
      default: 1
    }], (answers) => {
      if (!answers['name']) {
        return print.error('Please choose a phrase name')
      }
      if (!answers['url']) {
        return print.error('Please choose a phrase url')
      }
      if (!answers['verbs']) {
        return print.error('Please select any verb')
      }
      genPhrase(answers['name'], answers['url'], answers['verbs'], sourceLocation, (err) => {
        if (err) {
          print.error(err)
        } else {
          print.ok('Phrase generated under the folder:', sourceLocation);
        }
      })
    })
}

/**
 * Generate Snippet
 */
// phraseGenerator(answers['name'], answers['url'], answers['verbs'])
let generateSnippet = (sourceLocation) => {
    inquirer.prompt([{
      type: 'input',
      name: 'name',
      message: 'Which name would you like for your snippet?',
      default: 'userModel'
    }], (answers) => {
      if (!answers['name']) {
        return print.error('Please choose a snippet name')
      }
      genSnippet(answers['name'], sourceLocation, (err) => {
        if (err) {
          print.error(err)
        } else {
          print.ok('Phrase generated under the folder:', sourceLocation);
        }
      })
    })
}

module.exports = generatorWithQuestions;