import chalk from 'chalk'
let print = {}
print.error = (text) => { console.log(chalk.white.bgRed.bold(' Error:') + ' ' + chalk.white(text)) }
print.ok = (text) => { console.log(chalk.white.bgGreen.bold(' OK:') + ' ' + chalk.white(text)) }
print.info = (text) => { console.log(chalk.white.bgYellow.bold(' INFO:') + ' ' + chalk.white(text)) }

module.exports = print
