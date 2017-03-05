exports.ContentCache = ContentCache;

function ContentCache() {
    this._cache = Object.create(null);
}

ContentCache.prototype = {

    constructor: ContentCache,

    getContent: function (scriptName, modifyAt) {
        var item = this._get(scriptName, modifyAt);

        if (!item) {
            return (null);
        }

        return (item.content);
    },

    getETag: function (scriptName, modifyAt) {
        var item = this._get(scriptName, modifyAt);

        if (!item) {
            return (null);
        }

        return (item.etag);
    },

    putContent: function (scriptName, content, modifyAt) {
        var item = this._get(scriptName, modifyAt);

        if (item) {
            return (item.content = content);
        }

        this._cache[scriptName] = {
            scriptName: scriptName,
            content: content,
            etag: null,
            modifyAt: modifyAt
        };

        return (content);
    },

    putETag: function (scriptName, etag, modifyAt) {
        var item = this._get(scriptName, modifyAt);

        if (item) {
            return (item.etag = etag);
        }

        this._cache[scriptName] = {
            scriptName: scriptName,
            content: null,
            etag: etag,
            modifyAt: modifyAt
        };

        return (etag);
    },

    _get: function (scriptName, modifyAt) {
        var item = this._cache[scriptName];

        if (!item) {
            return (null);
        }

        if (item.modifyAt < modifyAt) {
            delete(this._cache[scriptName]);
            return (null);
        }

        return (item);
    }
};
