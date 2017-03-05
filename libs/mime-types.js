module.exports = (function(){

    //mime-type interface
    return({
        getFromFileExtension: getFromFileExtension,
        getFromFileName: getFromFileName,
        getFromFilePath: getFromFilePath
    });

    function getFromFileExtension(extension){
        switch (extension.toLowerCase()){
            case 'gif' :
                return ('image/gif');
            break;
            case 'jpg' :
            case 'jpeg' :
            case 'jpe' :
                return ('image/jpeg');
            break;
            case 'png' :
                return ('image/png');
            break;
            case 'tiff':
                return ('image/tiff');
            break;
            case 'css' :
                return ('text/css');
            break;
            case 'htm' :
            case 'html' :
                return ('text/html');
            break;
            case 'js' :
                return ('text/javascript');
            break;
            case 'txt' :
                return ('text/plain');
            break;
            case 'json' :
                return ('application/x-json');
            break;
            default :
                return('application/octet-stream');
            break;
        }
    }

    function getFromFileName(filename){
        return (getFromFileExtension(filename.split('.').pop()));
    }

    function getFromFilePath(path){
        return (getFromFileName(path));
    }
})();
