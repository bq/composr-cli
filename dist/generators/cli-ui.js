'use strict';

var _inquirer = require('inquirer');

var _inquirer2 = _interopRequireDefault(_inquirer);

var _phrase = require('./phrase');

var _phrase2 = _interopRequireDefault(_phrase);

var _snippet = require('./snippet');

var _snippet2 = _interopRequireDefault(_snippet);

var _print = require('../print');

var _print2 = _interopRequireDefault(_print);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var generatorWithQuestions = function generatorWithQuestions(config) {
  _inquirer2.default.prompt([{
    type: 'list',
    name: 'type',
    message: 'What do you want to create?',
    choices: [{
      name: 'A new endpoint (Phrase)',
      value: 'phrase'
    }, {
      name: 'A snippet of code',
      value: 'snippet'
    }],
    default: 1
  }], function (answers) {
    switch (answers['type']) {
      case 'phrase':
        generatePhrase(config.source_location + '/phrases');
        break;
      case 'snippet':
        generateSnippet(config.source_location + '/snippets');
        break;
    }
  });
};

/**
 * Generate Phrase
 */
// phraseGenerator(answers['name'], answers['url'], answers['verbs'])
var generatePhrase = function generatePhrase(sourceLocation) {
  _inquirer2.default.prompt([{
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
  }], function (answers) {
    if (!answers['name']) {
      return _print2.default.error('Please choose a phrase name');
    }
    if (!answers['url']) {
      return _print2.default.error('Please choose a phrase url');
    }
    if (!answers['verbs']) {
      return _print2.default.error('Please select any verb');
    }
    (0, _phrase2.default)(answers['name'], answers['url'], answers['verbs'], sourceLocation, function (err) {
      if (err) {
        _print2.default.error(err);
      } else {
        _print2.default.ok('Phrase generated under the folder:', sourceLocation);
      }
    });
  });
};

/**
 * Generate Snippet
 */
// phraseGenerator(answers['name'], answers['url'], answers['verbs'])
var generateSnippet = function generateSnippet(sourceLocation) {
  _inquirer2.default.prompt([{
    type: 'input',
    name: 'name',
    message: 'Which name would you like for your snippet?',
    default: 'userModel'
  }], function (answers) {
    if (!answers['name']) {
      return _print2.default.error('Please choose a snippet name');
    }
    (0, _snippet2.default)(answers['name'], sourceLocation, function (err) {
      if (err) {
        _print2.default.error(err);
      } else {
        _print2.default.ok('Phrase generated under the folder:', sourceLocation);
      }
    });
  });
};

module.exports = generatorWithQuestions;