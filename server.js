const http = require('http');
const chalk = require('chalk');

const config = require('./libs/config');
const staticFileServer = require('./libs/static-file-server');

const mode = process.env.MODE;

var fileServer = staticFileServer.createServer({

    documentRoot: (__dirname + '/wwwroot/'),

    defaultDocument: 'index/html',

    maxAge: 604800, //week(7 days)

    magicPattern: /build-[\d.-]+/i,

    maxCacheSize: (1024 * 100) // 100Kb

});

var httpServer = http.createServer(
    function(req, res){
        fileServer.serveFile(req, res);
    }
);

httpServer.listen(config.get(mode+':port'), config.get(mode+':host'));

console.log(chalk.cyan(`Server listening on port ${config.get(mode+':port')}`));