var utils = require('../lib/utils');

exports.verify = function(username, host, signedData, callback) {
    if(!username || typeof username !== 'string') {
        throw 'No username provided';
    }
    else if(!host || typeof host !== 'string') {
        throw 'No host provided';
    }
    else if(!signedData || typeof signedData !== 'string') {
        throw 'No signed data provided';
    }
    else {
        var url = 'https://auth.kik.com/verification/v1/check?u='+
                username + '&d=' + host;
        if (global.ZERVER_DEBUG) {
            url += '&debug=true';
        }
        verifyRequest(url, signedData, callback);
    }
}

function verifyRequest(url, body, callback, retry) {
    retry = retry || 0;
    utils.httpRequest(url, body, function(status, data) {
        if(status == 200) {
            callback();
        }
        else if( !status ) {
            // exponential back off on retries
            if(retry < 4) {
                retry++;
                var retrySecs = Math.pow(2, retry)
                setTimeout(function() {
                    verifyRequest(url, body, callback, retry);
                }, retrySecs * 1000);
                console.log('verify request failed. waiting '+ retrySecs +' seconds before retrying.');
            }
            else {
                callback('Something went terribly wrong');
                console.log('verify request failed. given up trying.');
            }
        }
        else {
            callback('Something went terribly wrong');
        }
    });
}
