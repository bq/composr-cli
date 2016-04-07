/**
 * Environments manager
 */

const envManager = (config, next) => {
    let envs = []
    config.environments.forEach(env => {
        envs.push({
            name: env.name,
            composrEndpoint: env.urlBase.replace('{{module}}', 'composr').replace('v1.0/', '')
        })
    })

    return next(null, envs)
}

module.exports = envManager