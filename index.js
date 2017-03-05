const fileSystem = require('fs');
const url = require('url');
const stream = require('stream');
const util = require('util');
const crypto = require('crypto');
const Q = require('q');

const mimeTypes = require('./libs/mime-types');
const ContentCache = require('./libs/content-cache').ContentCache;
const ETagStream = require('./libs/etag.stream').ETagStream;
const BufferReadStream = require('./libs/buffer-read-stream').BufferReadStream;
const BufferWriteStream = require('./libs/buffer-write-stream').BufferWriteStream;

exports.createServer = function (config) {
    return new StaticFileServer(config);
};

exports.StaticFileServer = StaticFileServer;

var fileSystemStat = Q.nbind(fileSystem.stat, fileSystem);

function StaticFileServer(config) {
    this._config = config;
    this._contentCache = new ContentCache();
}


StaticFileServer.prototype = {
    constructor: StaticFileServer,

    serveFile: function (request, response) {
        var server = this;

        var parsedUrl = url.parse(request.url);
        var scriptName = this._resolvePath(parsedUrl.path);

        this._resolveScriptName(scriptName).then(
            function handleScriptNameResolve(resolution) {

                var etag = server._contentCache.getETag(resolution.scriptName, resolution.stat.mtime);

                if (etag) {
                    response.setHeader('ETag', etag);

                    if (etag === request.headers['if-none-match']) {
                        response.writeHead(304, 'Not Modified');

                        return response.end();
                    }
                }

                response.setHeader('Content-Type', mimeTypes.getFromFilePath(resolution.scriptName));
                response.setHeader('Content-Length', resolution.stat.size); 

                if (server._config.maxAge) {
                    response.setHeader('Cache-Control', 'max-age=' + server._config.maxAge);
                }

                response.statusCode = 200;

                var content = server._contentCache.getContent(scriptName, resolution.stat.mtime);
                if (content) {
                    var bufferReadStream = new BufferReadStream(content);
                    return bufferReadStream.pipe(response);
                }

                var contentStream = fileSystem.createReadStream(resolution.scriptName)
                    .on('open', function handleContentReadStreamOpen() {
                        contentStream.pipe(response);
                    })
                    .on('error', function handleContentReadStreamError(error) {
                        try {
                            response.setHeader('Content-Length', 0);
                            response.setHeader('Cache-Control', 'max-age=0');
                            response.setHeader(500, 'Server Error');
                        } catch (e) {

                        } finally {
                            response.end('500 Server Error');
                        }
                    });

                if (!etag) {
                    var etagStream = new ETagStream()
                        .on('etag', function handleETag(etag) {
                            server._contentCache.putETag(resolution.scriptName, etag, resolution.stat.mtime)
                        });
                    contentStream
                        .on('error', function handleContentStreamError(error) {
                            etagStream.destroy();
                        })
                        .pipe(etagStream);
                }

                if (server._config.maxCacheSize && resolution.stat.size <= server._config.maxCacheSize) {

                    var bufferWriteStream = new BufferWriteStream()
                        .on('buffer', function handleBuffer(content){
                            server._contentCache.putContent(scriptName, content, resolution.stat.mtime);
                        });

                    contentStream
                        .on('error', function handleContentStreamError(error){
                            bufferWriteStream.destroy();
                        })
                        .pipe(bufferWriteStream);
                }
            }, function handleScriptNameReject(error){
                response.writeHead(404, 'Not Found');
                response.end('404 File Not Found');
            }
        );
    },

    _resolvePath: function(path){
        path = decodeURIComponent(path.replace(/\\/g, '/'));
        path = path.replace(/\\/g, '/');

        if(this._config.magicPattern){
            path = path.replace(this._config.magicPattern, '');
        }

        path = path.replace(/[/]{2,}/g, '/');

        path = path.replace(/^[/][/]$/g, '');

        path = path.replace(/\.\.\//g, '/');

        path = path.replace(/^\/+/g, '');

        return url.resolve(this._config.documentRoot, path);
    },

    _resolveScriptName: function(scriptName){
        var defaultScriptName = scriptName.slice(-1) === '/'
            ? (scriptName + this._config.defaultDocument)
            : (scriptName + '/' + this._config.defaultDocument);

        return fileSystemStat(scriptName).then(
            function handleFileResolve(stat) {
                if (stat.isFile()) {
                    return {
                        scriptName: scriptName,
                        stat: stat
                    }
                }

                return fileSystemStat(defaultScriptName).then(
                    function handleDirectoryResolve(stat) {
                        return {
                            scriptName: defaultScriptName,
                            stat: stat
                        }
                    }
                );
            }
        );
    }
};
