const stream = require('stream');
const util = require('util');
const buffer = require('buffer');

exports.BufferReadStream = BufferReadStream;

function BufferReadStream(source){
    if(!buffer.isBuffer(source)){
        throw new Error('BufferReadStream source must be a buffer.');
    }

    stream.Readable.call(this);

    this._source = source;
    this._index = 0;
    this._length = this._source.length;
}

util.inherits(BufferReadStream, stream.Readable);

BufferReadStream.prototype = {
    constructor: BufferReadStream,

    destroy: function(){
        this._source = null;
        this._index = null;
        this._length = null;
    },

    _read: function(size) {
        if(this._index < this._length){
            this.push(this._source.slice(this._index, (this._index += size)));
        }

        if(this._index >= this._length){
            this.push(null);
        }
    }
};
