import Linter from 'ramllint'
import fs from 'fs'
import crypto from 'crypto'
import zlib from 'zlib'
import raml from 'raml2obj'
import cli from 'cli'
import _ from 'lodash'
import reRead from 'recursive-readdir'
import async from 'async'
// Instances
const ramllint = new Linter()
  // Consts
let CONFIG = {}
  /**
   * Entry Point
   */
let parseRaml = (dev, config, next) => {
  CONFIG = config
  let ramlLoc = process.cwd() + '/' + CONFIG.api_raml_location
  fs.readFile(ramlLoc, (err, data) => {
    let exists = (err ? false : true)

    if (exists) {
      decodeRaml(config, ramlLoc, (err, result) => {
        if (err) return next(err, null)
        getRoutesFilesPaths(result, (err, objToComposrJson) => {
          if (err) return next(err, null)
          writeToComposrJson(config, objToComposrJson, next)
        })
      })
    } else {
      return next(err, null)
    }
  })
}

/**
 * Decode Raml
 */
let decodeRaml = (config, ramlLoc, next) => {
    ramllint.lint(ramlLoc, (results) => {
      if ( /* !results.length ||*/ true) {
        raml.parse(ramlLoc).then((ramlObj) => {
          // get phrases codes
          searchPhrasesOnResource(ramlObj.resources, (err, result) => {
            if (err) return next(err, null)
              // console.log(JSON.stringify(result, null, 2))
            cli.ok('RAML encoding done')
            let response = {
              ramlObj: ramlObj,
              phrases: result
            }
            return next(null, response)
          })
        }, (err) => {
          // REturn error if raml load cant get raml
          return next(err, null)
        })
      } else {
        // if verification is failed
        return next(results, null)
      }
    })
  }
  /**
   * Function to encode code src to base64 hash
   */
let getRoutesFilesPaths = (ramlObj, next) => {
  let completePath = process.cwd() + '/' + CONFIG.source_location
  let ramlRoutes = ramlObj.phrases.map((route) => {
    if (_.has(route, 'get')) return route.get.code_path
    if (_.has(route, 'put')) return route.put.code_path
    if (_.has(route, 'post')) return route.post.code_path
    if (_.has(route, 'delete')) return route.delete.code_path
  })
  let phrases = []
  // Search code files in path
  reRead(completePath, (err, files) => {
    if (err) return next(err, null)
    // Compare results with API raml routes
    compareFiles(files, ramlRoutes, (err, results) => {
      // Handler files founded and correspond with API route
      if (err) return next(err, null)
      async.filter(results, (file, callback) => {
        codeToHash(file.path, (err, hashObj) => {
          file.hash = hashObj
          phrases.push(file)
          callback(null, !err)
        })
      }, (results) => {
        return next(null, phrases)
      })
    })
  })
}
/**
 * Write Composr Json with parsed API Raml,
 * to decode: new Buffer("SGVsbG8gV29ybGQ=", 'base64').toString('ascii')
 */
let writeToComposrJson = (config, ramlObj, next) => {
    let apiParsed = JSON.stringify(ramlObj)
    config._raml = {
      hash: new Buffer(apiParsed).toString('base64'),
      md5: crypto.createHash('md5').update(apiParsed).digest('hex')
    }
    fs.writeFile(process.cwd() + '/.composr', JSON.stringify(config, null, 2), 'utf8', (err) => {
      if (err) return next(err, null)
      compressFile((err, result) => {
        if (!err) return next(null, true)
        return next(err, null)
      })
    })
  }
/**
 * Compare files betwen API RAMl and FS founded files
 */
let compareFiles = (files, ramlRoutes, next) => {
  // Get filename from path
  let filesToCompare = files.map(route => {
    let _fileName = route.split('/')
    return _fileName[_fileName.length - 1]
  })
  // Get filename and file path together
  let filesCompleteObj = files.map(route => {
    let fileName = route.split('/')
    let fileObj = {}
    fileObj.fileName = fileName[fileName.length - 1]
    fileObj.path = route
    return fileObj
  })
  // difference betwen files from raml routes and FS
  let filesFounded = _.intersection(ramlRoutes, filesToCompare)
  cli.info('==============================')
  cli.info('| Routes without source code: |')
  cli.info('==============================')
  _.difference(ramlRoutes, filesToCompare).map((route) => {
    cli.info(route)
  })
  console.log('\n')
  cli.ok('==============================')
  cli.ok('| Routes With source code:    |')
  cli.ok('==============================')
  filesFounded = filesFounded.map(route => {
    cli.ok(route)
    let indexRoute = _.findIndex(filesCompleteObj, o => { return o.fileName === route })
    let resObj = {
      path: filesCompleteObj[indexRoute].path,
      phraseIndex: ramlRoutes.indexOf(route)
    }
    return resObj
  })

  return next(null, filesFounded)
}
/**
 * code to Hash
 */
 let codeToHash = (filePath, next) => {
   fs.readFile(filePath, (err, data) => {
    if (err) return next(err, null)
    return next(null, {
      hash: new Buffer(data).toString('base64'),
      md5: crypto.createHash('md5').update(data).digest('hex')
    })
  })
 }
/**
 * Compress File to distribution
 */
let compressFile = next => {
  const gzip = zlib.createGzip()
  const inp = fs.createReadStream(process.cwd() + '/.composr')
  const out = fs.createWriteStream(process.cwd() + '/.composr.gz')
  inp.pipe(gzip).pipe(out)
  return next()
}
  /**
   * get Routes And Code
   */
let searchPhrasesOnResource = (resources, next) => {
  let __phrases = []

  let recursive = (resources, accumulatedPath) => {
    if (!resources) {
      return null
    }

    resources.forEach(resource => {
      var path = accumulatedPath + resource.relativeUri

      if (resource.methods) {
        var phrase = {}
        phrase.url = path.replace('{mediaTypeExtension}', '')
        phrase.url = phrase.url.replace(/{(.*?)}/i, '')
          // TODO: Aqui hay que generar el id con formato domain!project!version!url!params
        phrase.id = '<id>'

        resource.methods.forEach(method => {
          phrase[method.method] = {}
          phrase[method.method].code = '<codehash>'
            /**
             * CODE FILES PATTERN
             * [path1].[path2].[,...].[httpMethod].code.js
             */
          let pathParts = phrase.url.split('/')
          let tempPath = ''
          pathParts.forEach(part => {
            if (part !== '') tempPath += part + '.'
          })
          tempPath += method.method + '.code.js'
          phrase[method.method].code_path = tempPath
            // TODO: Aqui irían los middlewares
          phrase[method.method].middlewares = ['validate', 'mock']
        })

        __phrases.push(phrase)
      }
      recursive(resource.resources, path)
    })

    return __phrases
  }

  let parsedPhrases = recursive(resources, '')

  return next(null, parsedPhrases)
}

module.exports = parseRaml
