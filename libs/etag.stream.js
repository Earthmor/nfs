const stream = require('stream');
const util = require('util');
const crypto = require('crypto');
const buffer = require('buffer');

exports.ETagStream = ETagStream;

function ETagStream(){
    stream.Writable.call(this);

    this._etag = null;
    this._hasher = crypto.createHash('md5');
    this._destroyed = false;

    this.once('finish', this._handleFinish(this));
}

util.inherits(ETagStream, stream.Writable);

ETagStream.prototype = {

    constructor: ETagStream,

    destroy: function(){
        if(this._destroyed) {
            return;
        }

        this._etag = null;
        this._hasher = null;
    },

    _handleFinish: function(event){
        if(this._destroyed){
            return;
        }

        this.emit('etag', (this._etag = this._hasher.digest('hex')));
        this.destroy();
    },

    _write: function(chunk, encoding, writeComplete){
        if(!buffer.isBuffer(chunk)){
            throw (new Error('ETagStream can only accept buffers.'))
        }

        if(this._destroyed){
            return (writeComplete(new Error('ETagStream has been destroyed')))
        }

        this._hasher.update(chunk);

        writeComplete();
    }
};

