import request from 'request'
import * as _ from 'lodash'
import fs from 'fs'
import syncFor from './utils/syncFor'
import print from './print'
import _progress from 'cli-progress'


/**
 * pubPhrase method, this method send phrases and
 * snippet data to your composr
 */
function pubPhrase (_type, data, callback) {
  let modelType = (_type === 'phrase') ? 'phrase' : 'snippet'
  let uploadUrl = process.env.ENV_ENDPOINT + modelType
  let _json = (_type === 'phrase') ? JSON.parse(data) : data
  _json.version = process.env.PROJECT_VERSION
  // progress bar

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
      //gt.pulse(body.url)
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
      '__meta.marked': true
    }).map((item) => {
      return fs.readFileSync(item.__meta.modelPath)
    })
  } else{
    _items = items
  }
  // Progress Bar
  let bar1 = new _progress.Bar({
    format : 'Publishing [{bar}] {percentage}% | ETA: {eta}s | Current: P({value})',
    hideCursor: true,
    barCompleteChar: '#',
    barIncompleteChar: '.',
    fps: 5,
    clearOnComplete: true
  })

  bar1.start(_items.length, 0)

  syncFor(0, _items.length, 'start', (i, status, call) => {
    if (status === 'done') {
      bar1.stop()
      print.info('All '+ _type +' are published successfully')
      return next(null, true)
    } else {
      bar1.update(i)
      pubPhrase(_type, _items[i], (err, res) => {
        if (err) print.error(err)
        call('next') // this acts as increment (i++)
      })
    }
  })
}

module.exports = Publisher
