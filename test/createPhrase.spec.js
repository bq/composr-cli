import test from 'tape'
import createPhrase from '../src/generators/phrase'
import fs from 'fs'

test('createPhrase, model generation', (t) => {
  t.plan(6)
  let phraseName = 'user list'
  let url = 'users/list'
  let verbs = ['put', 'post']

  createPhrase(phraseName, url, verbs, './.tmp/', function (err) {
    t.equal(err, null, 'Does not return an error')

    var fileExists = fs.existsSync('./.tmp/userList/userList.model.json')
    t.equal(fileExists, true, 'The file is written')

    var fileBody = fs.readFileSync('./.tmp/userList/userList.model.json', 'utf-8')
    var thePhrase = JSON.parse(fileBody);
    t.ok(thePhrase.put, 'It does contain the PUT verb')
    t.ok(thePhrase.post, 'It does contain the POST verb')
    t.notOk(thePhrase.delete, 'It does not contain the DELETE verb')
    t.notOk(thePhrase.get, 'It does not contain the GET verb')
  })
})

test('createPhrase, code generation', (t) => {
  t.plan(3)
  let phraseName = 'book store'
  let url = 'admin/book/store'
  let verbs = ['get', 'delete']

  createPhrase(phraseName, url, verbs, './.tmp/', function (err) {
    t.equal(err, null, 'Does not return an error')

    var getCodeFileExists = fs.existsSync('./.tmp/bookStore/bookStore.get.code.js')
    t.equal(getCodeFileExists, true, 'The GET code file is written')
    var deleteCodeFileExists = fs.existsSync('./.tmp/bookStore/bookStore.delete.code.js')
    t.equal(deleteCodeFileExists, true, 'The DELETE code file is written')
  })
})