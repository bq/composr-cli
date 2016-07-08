import request from 'request'
import * as _ from 'lodash'
import fs from 'fs'
import syncFor from './utils/syncFor'
import print from './print'

function pubPhrase (_type, data, callback) {
  let modelType = (_type === 'phrase') ? 'phrase' : 'snippet'
  let uploadUrl = process.env.ENV_ENDPOINT + modelType
  let _json = (_type === 'phrase') ? JSON.parse(data) : data
  // call to request
  request({
    url: uploadUrl,
    headers: {
      'Authorization': 'Bearer ' + process.env.AT
    },
    method: 'PUT',
    json: _json
  }, (err, response, body) => {
    if (err) callback(err, null)
    if (response.statusCode === 401) {
      console.log(response.statusCode)
    } else if (response.statusCode.toString().indexOf('2') === 0) {
      print.ok(_type + ' published: ' + body.url)
    } else {
      print.error(_type + ' not published: ' + body.url + response.statusCode)
    }
    return callback(null, response)
  })
}

function Publisher (_type, items, next) {
  let _items = null

  if (_type === 'phrase'){
    _items = _.filter(items, {
      'marked': true
    }).map((item) => {
      return fs.readFileSync(item.modelPath)
    })
  } else{
    _items = items
  }

  syncFor(0, _items.length, 'start', (i, status, call) => {
    if (status === 'done') {
      print.info('All '+ _type +' are published successfully')
      return next(null, true)
    } else {
      pubPhrase(_type, _items[i], (err, res) => {
        if (err) print.error(err)
        call('next') // this acts as increment (i++)
      })
    }
  })
}

module.exports = Publisher
