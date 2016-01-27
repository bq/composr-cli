/**
 * @param {Type}
 * @return {Type}
 */
import cli from 'cli'
import jsonfile from 'jsonfile'
import util from 'util'

export function run() {

  /*let i = 0, interval = setInterval(function () {
      cli.progress(++i / 100);
      if (i === 100) {
          clearInterval(interval);
          cli.ok('Finished!');
      }
  }, 50);*/

  cli.parse({
    init : ['i', 'Create a composr.json in your project.'],
    publish: ['p', 'Publish all your phrases to CompoSR'],
    update: ['u', 'Update at CompoSR.io your composr.json']
  })

  cli.main((args,options) =>{
    cli.debug(JSON.stringify(options))
    cli.debug(args)
    if(options.init) init()
  })
}


function init(){
  cli.info(__dirname)
}
















