import profiler from 'v8-profiler'
import fs from 'fs'
import print from './print'
import http from 'http'

/**
 * Profiler module
 */
const Profiler = (options) => {

  print.info('Profiling CPU')
  let _time = parseInt(options.time) * 1000
  const PORT = parseInt(options.port) || 3434
  profiler.startProfiling('1', true)
  const PROF_NAME = 'profile_' + Date.now() + '.json'

  setTimeout(function () {
    var profile = profiler.stopProfiling('')
    print.info(profile.getHeader())
    profiler.deleteAllProfiles()
    profile.export(function (error, result) {
      fs.writeFileSync('profile_' + Date.now() + '.json', result)
      print.ok('Profile created')
      if (options.live) {
        _loadServer(PORT, PROF_NAME)
      }
    })
  }, _time)
}

function handleRequest (request, response) {
  response.end('It Works!! Path Hit: ' + request.url)
}

const _loadServer = (port) => {
  // Create a server
  var server = http.createServer(handleRequest)

  // Lets start our server
  server.listen(port,  () => {
    // Callback triggered when server is successfully listening. Hurray!
    console.log('Server listening on: http://localhost:%s', port)
  })
}

module.exports = Profiler
