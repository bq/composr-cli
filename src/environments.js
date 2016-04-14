/**
 * Environments manager
 */

const envManager = (config, next) => {
    let envs = []
    config.environments.forEach(env => {
        envs.push({
            name: env.name,
            composrEndpoint: env.urlBase.replace('{{module}}', 'composr').replace('v1.0/', ''),
            credentials : {
            	clientId : env.clientId,
            	scopes : env.scopes,
            	urlBase: env.urlBase,
            	clientSecret: env.clientSecret
            }
        })
    })

    return next(null, envs)
}

module.exports = envManager