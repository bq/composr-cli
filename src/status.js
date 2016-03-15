import req from 'request'
import Table from 'cli-table'
import chalk from 'chalk'

let _request = (urls, callback) => {
  'use strict'

  let results = {},
    t = urls.length,
    c = 0,
    handler = (error, response, body) => {

      let url = response.request.uri.href

      results[url] = {
        error: error,
        response: response,
        body: body
      }

      if (++c === urls.length) {
        callback(results)
      }
    }

  while (t--) {
    req(urls[t], handler)
  }
}
const status = (environmentsUrls, spinner) => {
  spinner.start()
  _request(environmentsUrls, (responses) => {
    spinner.stop()
    let table = new Table({
    head: [
      'Url',
      'Env',
      'Domains',
      'Version',
      'Phrases',
      'Phrases Loaded',
      'Worker',
      'IAM',
      'Resources',
      'Assets',
      'Evci']
    })

    for (let url in responses) {
      let res = responses[url]
      if (res.error) {
        console.log('Error', url, res.error)
        return
      }
      if (res.body) {
        res.body = JSON.parse(res.body)
        table.push([
          chalk.blue(url),
          chalk.green(res.body.env),
          res.body.domains,
          res.body.version,
          chalk.green(res.body.statuses.phrases),
          res.body.statuses.phrasesLoaded,
          res.body.statuses.worker,
          res.body.statuses.iam,
          res.body.statuses.resources,
          res.body.statuses.assets,
          res.body.statuses.evci])
      }
    }
    console.log(table.toString())
  })
}

module.exports = status
