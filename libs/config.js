var nconf = require('nconf');

/**
 * Setup nconf to application
 *  argv() - command-line arguments
 *  env()  - environment variables
 *  file() - variable from file
 */
nconf
    .argv()
    .env()
    .file('./config/tsconfig.json');

module.exports = nconf;