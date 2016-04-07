var composrBuild = require('../node_modules/composr-cli/dist/build');
var corbel = global.corbel = require('corbel-js');
var sinon = global.sinon = require('sinon');
var chai = global.chai = require('chai');
var expect = global.expect = chai.expect;
var should = global.should = chai.should();
var chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);

var URL_BASE = global.URL_BASE = 'https://composr.bqws.io/{{module}}/v1.0/';
var composr = global.composr = require('composr-core');
var sandbox = global.sandbox = sinon.sandbox.create();
var domain = global.domain = 'my:domain';

/**
 * Initialize composr core and suscribe to its events
 * @type {Object}
 */
composr.init({
  credentials: {
    clientId: 'demo',
    clientSecret: 'demo',
    scopes: 'demo'
  },
  urlBase: URL_BASE
});

//Suscribe to core log events
composr.events.on('debug', 'phrasesProject', function() {
  console.log.apply(console, arguments);
});

composr.events.on('info', 'phrasesProject', function() {
  console.info.apply(console, arguments);
});

composr.events.on('error', 'phrasesProject', function() {
  console.warn.apply(console, arguments);
});

composr.events.on('warn', 'phrasesProject', function() {
  console.warn.apply(console, arguments);
});

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

before(function(done) {
  this.timeout(50000);

  loadModelsDefinitions()
    .then(function(items){
      //Register the phrases.
      return Promise.all([
        composr.Phrase.register(domain, items.phrases),
        composr.Snippet.register(domain, items.snippets)
      ]);
    })
    .then(function(){
      done();
    })
    .catch(function(err){
      done(err);
    });
});

afterEach(function() {
  sandbox.restore();
});