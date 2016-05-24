/**
 * Publisher module
 */
import fs from 'fs'
import print from './print'
import spinner from 'simple-spinner'
import * as _ from 'lodash'
import http from 'https'
import request from 'request'
import EventEmitter from 'events'
import util from 'util'
import querystring from 'querystring'
import URL from 'url'

/**
 * [Publisher description]
 * @param {[type]}   items [description]
 * @param {Function} next  [description]
 */
function Publisher (items, next) {
  this.items = _.filter(items, {
    'marked': true
  }).map((item) => {
    return item.modelPath
  })
  this.itemsLength = this.items.length
  this.next = next
  this.counter = 0
  this.partial_counter = 0
  this.busy = true
  this.req = new Requester()
  // Every request emmits an end event
  this.req.on('end', () => {
    this.partial_counter++
    this.counter++
    if (this.partial_counter === 5) {
      this.partial_counter = 0
      this.start()
    }

    if (this.itemsLength === this.counter) {
      return this.next(null, true)
    }
  })

  // run
  this.start()
}

/**
 * [start description]
 * @return {[type]} [description]
 */
Publisher.prototype.start = function () {
  const that = this
  this.temporalItems = []

  while (this.temporalItems.length < 5) {
    this.temporalItems.push(this.items.pop())
  }

  this.temporalItems.forEach((element) => {
    const modelFile = fs.readFileSync(element)
    that.req.publish(modelFile)
  })
}

/**
 * [Requester description]
 * @param {[type]} data [description]
 */
function Requester () {
  EventEmitter.call(this)
}

/**
 * [publish description]
 * @param  {[type]} data [description]
 * @return {[type]}      [description]
 */
Requester.prototype.publish = function (data) {
  this.retries = 3
  var that = this

  request({
    url: process.env.ENV_ENDPOINT + 'phrase',
    headers: {
      'Authorization': 'Bearer ' + process.env.AT
    },
    method: 'PUT',
    json: data
  }, (error, response, body) => {
    if (response.statusCode === 401) {
      if (error) print.error(error)
      print.info('Got a 401, retrying after 500ms')
      setTimeout(function () {
        if (that.retries > 0) {
          that.publish(data)
          that.retries--
        }
      }, 1000)
    } else if (response.statusCode.toString().indexOf('2') === 0) {
      that.emit('end')
    } else {
      print.error('Error creating item: ' + response.statusCode + ' ' + error)
      that.emit('end')
    }
  })
}
// inherits
util.inherits(Requester, EventEmitter)

module.exports = new Publisher()
