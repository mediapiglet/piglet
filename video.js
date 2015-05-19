var http = require('http'),
    fs = require('fs'),
    url = require('url'),
    util = require('util');

var config = require('./config/piglet.json');
var listenAddress = config.piglet.videojs.videoListenAddress;

http.createServer(function (req, res) {
    var parsedUrl = url.parse(req.url, true); // true to get query as object
    var getParams = parsedUrl.query;


    var path = new Buffer(getParams.path, 'base64').toString(); // Ta-da
    var stat = fs.statSync(path);
    var total = stat.size;
    if (req.headers['range']) {
        var range = req.headers.range;
        var parts = range.replace(/bytes=/, "").split("-");
        var partialstart = parts[0];
        var partialend = parts[1];

        var start = parseInt(partialstart, 10);
        var end = partialend ? parseInt(partialend, 10) : total-1;
        var chunksize = (end-start)+1;

        var file = fs.createReadStream(path, {start: start, end: end});
        res.writeHead(206, { 'Content-Range': 'bytes ' + start + '-' + end + '/' + total, 'Accept-Ranges': 'bytes', 'Content-Length': chunksize, 'Content-Type': 'video/mp4' });
        file.pipe(res);
    } else {
        res.writeHead(200, { 'Content-Length': total, 'Content-Type': 'video/avi' });
        fs.createReadStream(path).pipe(res);
    }
}).listen(1337, listenAddress);
console.log('Server running at http://'+listenAddress+':1337/');
