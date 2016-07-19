module.exports = JSON.stringify({
  "name": "<%= projectname %>",
  "version": "0.0.0",
  "description": "A new composr project",
  "authors": [
    "<%= username %>"
  ],
  "repository": {
    "type": "git",
    "url": ""
  },
  "scripts": {
    "test": "grunt test",
    "debug": "node-debug grunt test --debug-brk",
    "doc": "node scripts/serveDoc.js"
  },
  "devDependencies": {
    "chai": "^3.0.0",
    "chai-as-promised": "^5.1.0",
    "composr-cli": "^0.5.1",
    "corbel-js": "0.4.0",
    "express": "^4.13.4",
    "grunt": "^0.4.5",
    "grunt-contrib-clean": "^0.6.0",
    "grunt-contrib-jshint": "^0.11.2",
    "grunt-mocha-test": "^0.12.7",
    "jshint-stylish": "^2.0.1",
    "load-grunt-tasks": "^0.6.0",
    "lodash": "^4.5.1",
    "mocha": "^2.3.3",
    "request": "^2.65.0",
    "sinon": "^1.17.1",
    "supertest": "^1.1.0",
    "time-grunt": "^1.2.1"
  },
  "dependencies": {
    "composr-core": "2.1.0",
    "minimatch": "^3.0.0",
    "request": "^2.64.0",
    "tap-file": "0.0.2"
  }
}, null, 2)
