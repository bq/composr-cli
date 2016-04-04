import test from 'tape'
import createSnippet from '../src/generators/snippet'
import fs from 'fs'

test('createSnippet, file generation', (t) => {
  t.plan(2)
  let snippetName = 'user list'

  createSnippet(snippetName, './.tmp/', function (err) {
    t.equal(err, null, 'Does not return an error')

    var fileExists = fs.existsSync('./.tmp/userList.snippet.js')
    t.equal(fileExists, true, 'The file is written')
  })
})