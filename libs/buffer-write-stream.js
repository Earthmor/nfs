const stream = require('stream');
const util = require('util');
const buffer = require('buffer');

exports.BufferWriteStream = BufferWriteStream;

function BufferWriteStream(){

    stream.Writable.call(this);

    this._buffers = [];
    this._destroyed = false;
    this.once('finish', this._handleFinish.bind(this));
}

util.inherits(BufferWriteStream, stream.Writable);

BufferWriteStream.prototype = {
    constructor: BufferWriteStream,

    destroy: function(){
        this._destroyed = true;
        this._buffers = null;
    },

    _handleFinish: function(){
        if(this._destroyed){
            return;
        }

        this.emit('buffer', buffer.concat(this._buffers));
        this.destroy();
    },

    _write: function(chunk, encoding, writeComplete){
        if(!buffer.isBuffer(chunk)){
            throw new Error('BufferWriteStream can only accept buffers');
        }

        if(this._destroyed){
            return writeComplete(new Error('BufferWriteStream has been destroyed'));
        }

        this._buffers.push(chunk);

        writeComplete();
    }
};
