import dir from 'node-dir'

/**
 * [findRaml description]
 * @param  {[type]} conf [description]
 * @return {[type]}      [description]
 */
function findRaml(conf) {
    locateFiles(conf,(files) => {
      console.log('Archivos localizados')
    })
}


/**
 * [locateFiles description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
function locateFiles(conf,cb) {
    // match only filenames with a .raml extension and that don't start with a `.´
    dir.readFiles(process.cwd()+'/'+conf.source_location, {
            match: /.raml$/,
            exclude: ['node_modules', 'test']
        }, function(err, content, next) {
            if (err) throw err;
            console.log('content:', content);
            next();
        },
        function(err, files) {
            if (err) throw err;
            console.log('finished reading files:', files);
            cb(files)
        });
}

module.exports = findRaml
