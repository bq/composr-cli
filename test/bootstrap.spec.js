import test from 'tape'
import bootstrap from '../src/generators/bootstrap'
import fs from 'fs'

test('bootstrap, file generation', (t) => {
  t.plan(7)
  bootstrap('./.tmp/', function (err) {
    t.equal(err, null, 'Does not return an error')

    var filesThatShouldExist = [
      'src',
      'src/phrases',
      'src/phrases/examplePhrase',
      'src/snippets',
      'src/snippets/userModel.snippet.js',
      'test'
    ]

    filesThatShouldExist.forEach(function(filename){
      var fileExists = fs.existsSync('./.tmp/' + filename)
      t.equal(fileExists, true, filename + ' exists')
    })
  })
})