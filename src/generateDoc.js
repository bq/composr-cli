import raml2html from 'raml2html'
import fs from 'fs'

const configWithDefaultTemplates = raml2html.getDefaultConfig()

function generateDoc (config, next) {
  console.log(config.api_raml_location)
  raml2html.render(process.cwd() + '/' + config.api_raml_location, configWithDefaultTemplates).then((result) => {
    // Save the result to a file or do something else with the result
    fs.writeFile(process.cwd() + '/api.html', result, (err) => {
      if (err) {
        return next(err, false)
      }
      return next(null, true)
    })
  }, (err) => {
    return next(err, null)
  })
}

module.exports = generateDoc
