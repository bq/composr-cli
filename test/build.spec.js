import test from 'tape'
import build from '../src/build'
import fs from 'fs'

test('build phrase', (t) => {
  t.plan(18)
  build({version : '0.0.0'}, function (err, files) {
    t.equal(err, null, 'Does not return an error')

    var filesThatShouldExist = [
      'test/fixtures/phrase',
      'test/fixtures/phrase/bookStore.model.json'
    ]

    filesThatShouldExist.forEach(function(filename){
      var fileExists = fs.existsSync('./.tmp/' + filename)
      t.equal(fileExists, true, filename + ' exists')
    })

    var fileBody = fs.readFileSync('./.tmp/test/fixtures/phrase/bookStore.model.json', 'utf-8')
    var thePhrase = JSON.parse(fileBody)
    t.ok(thePhrase.get, 'It does contain the GET verb')
    t.ok(thePhrase.delete, 'It does contain the DELETE verb')
    t.ok(thePhrase.version, 'It does contain the version property')
    t.ok(thePhrase.environments, 'It does contain the environments property')
    t.ok((thePhrase.environments[0] === '*'), 'Environments is set to default')

    ;['get', 'delete'].forEach(function(verb){
      ;['200', '400', '401'].forEach(function(status){
        t.ok(thePhrase[verb].doc.responses[status].body['application/json'].schema, verb + ' verb does contain the schema for ' + status)
      })
      t.ok(thePhrase[verb].codehash, verb + ' does contain the codehash')
      t.ok(thePhrase[verb].codehash.length > 0, verb + ' codehash has a length greater than 0')
    })
    
  })
})