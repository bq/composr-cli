import composr from 'composr-core'
/**
 * Model Validator
 * @param  {[type]}
 * @return {[type]}
 */
const modelValidator = (_model, config, next) => {
	if (config.force === true) return next(null, true)
    composr.Phrase.validate(_model.model)
    .then(function() {
        return next (null, true)
    })
    .catch(function(err) {
        return next (_model.model.url + ' not valid' + '\n' + JSON.stringify(err, null, 2) , false)
    })
}

module.exports = modelValidator