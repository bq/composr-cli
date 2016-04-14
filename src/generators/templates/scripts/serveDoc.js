'use strict'

var core = require('composr-core');
var composrBuild = require('../node_modules/composr-cli/dist/build');
var express = require('express');
var app = express();

var domain = 'demo:domain';

function loadModelsDefinitions(){
  return new Promise(function(resolve, reject){
    composrBuild({ version: '0.0.0'}, function(err, result){
      if(err){
        return reject(err);
      }else{
        resolve(result);
      }
    });
  });
}

app.get('/', function (req, res) {
  core.init({ urlBase : 'http://localhost:3000'}, false)
    .then(loadModelsDefinitions)
    .then(function(items){
      //Register the phrases.
      return Promise.all([
        core.Phrase.register(domain, items.phrases),
        core.Snippet.register(domain, items.snippets)
      ]);
    })
    .then(function(){
      return serveDocumentation(req, res);
    })
    .catch(function(err){
      console.log(err);
      res.status(500).send('Error', err);
    });
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});


function serveDocumentation (req, res, next) {

  var phrases = core.Phrase.getPhrases(domain)
  var snippets = core.Snippet.getSnippets(domain)

  return core.documentation(phrases, snippets, domain, '')
    .then(function (result) {
      res.send(result)
    });
}