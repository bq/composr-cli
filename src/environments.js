/**
 * Environments manager. Returns the list of environments.
 */

const envManager = (config, next) => {
    let envs = config.environments.map(env => {
        return {
            name: env.name,
            composrEndpoint: env.urlBase.replace('{{module}}', 'composr').replace('v1.0/', ''),
            credentials : {
            	clientId : env.clientId,
            	scopes : env.scopes,
            	urlBase: env.urlBase,
            	clientSecret: env.clientSecret
            }
        }
    })

    return next(null, envs)
}

module.exports = envManager