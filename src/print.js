import chalk from 'chalk'
let print = {}

print.error = (text) => {
  let msg = text
  if (typeof text !== 'string'){
    msg = JSON.stringify(text.data, null, 2)
  }
  console.log(chalk.white.bgRed.bold(' Error ') + ' ' + chalk.white(msg))
  process.exit(1)
}

print.ok = (text) => { console.log(chalk.white.bgGreen.bold(' OK ') + ' ' + chalk.white(text)) }
print.info = (text) => { console.log(chalk.white.bgCyan.bold(' INFO ') + ' ' + chalk.white(text)) }

module.exports = print
