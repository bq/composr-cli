import Linter from 'ramllint'
import raml2obj from 'raml2obj'
import fs from 'fs'
import crypto from 'crypto'
import zlib from 'zlib'

let ramllint = new Linter()

function parseRaml (dev, config, next) {
  let ramlLoc = process.cwd() + '/' + config.api_raml_location
  ramllint.lint(ramlLoc, (results) => {
    if ( /* !results.length ||*/ dev) {
      raml2obj.parse(ramlLoc).then((ramlObj) => {
        writeToComposrJson(config, ramlObj, next)
      })
    } else {
      return next(results, null)
    }
  })
}

/**
 * Write Composr Json with parsed API Raml,
 * to decode: new Buffer("SGVsbG8gV29ybGQ=", 'base64').toString('ascii')
 */
function writeToComposrJson (config, ramlObj, next) {
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

function compressFile (next) {
  const gzip = zlib.createGzip()
  const inp = fs.createReadStream(process.cwd() + '/.composr')
  const out = fs.createWriteStream(process.cwd() + '/.composr.gz')
  inp.pipe(gzip).pipe(out)
  return next()
}
module.exports = parseRaml
