import request from 'request'
import * as _ from 'lodash'
import fs from 'fs'
import syncFor from './utils/syncFor'
import print from './print'

function pubPhrase (data, callback) {
  request({
    url: process.env.ENV_ENDPOINT + 'phrase',
    headers: {
      'Authorization': 'Bearer ' + process.env.AT
    },
    method: 'PUT',
    json: JSON.parse(data)
  }, (err, response, body) => {
    if (err) callback(err, null)
    if (response.statusCode === 401) {
      console.log(response.statusCode)
    } else if (response.statusCode.toString().indexOf('2') === 0) {
      print.ok('Phrase published: ' + body.url)
    } else {
      print.error('Phrase not published: ' + body.url + response.statusCode)
    }
    return callback(null, response)
  })
}

function Publisher (items, next) {
  let _items = _.filter(items, {
    'marked': true
  }).map((item) => {
    return fs.readFileSync(item.modelPath)
  })

  syncFor(0, _items.length, 'start', (i, status, call) => {
    if (status === 'done') {
      print.ok('All phrases are published successfully')
    } else {
      pubPhrase(_items[i], (err, res) => {
        if (err) print.error(err)
        call('next') // this acts as increment (i++)
      })
    }
  })
}

module.exports = Publisher
