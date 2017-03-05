var nconf = require('nconf');

nconf
    .argv()
    .env()
    .file('./config/tsconfig.json');

module.exports = nconf;
