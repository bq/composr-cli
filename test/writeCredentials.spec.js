import test from 'tape'
import writeCredentials from '../src/writeCredentials'
import fs from 'fs'

test('writeCredentials', (t) => {
  t.plan(3)
  let filePath = './.tmp/pepe'

  writeCredentials(filePath, { hola: 'pepe'}, function (err) {
    t.equal(err, null, 'Does not return an error')

    var fileExists = fs.existsSync(filePath)
    t.equal(fileExists, true, 'The file is written')

    var fileBody = fs.readFileSync(filePath, 'utf-8')
    t.equal(fileBody, 'hola: pepe\n', 'The file contains yaml')
  })
})
