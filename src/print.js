import chalk from 'chalk'
let print = {}
print.error = (text) => { chalk.white.bgRed.bold('Error: ' + chalk.white(text)) }
print.ok = (text) => { chalk.white.bgGreen.bold('OK:' + chalk.white(text)) }
print.info = (text) => { chalk.white.bgYellow.bold('INFO:' + chalk.white(text)) }

module.exports = print
