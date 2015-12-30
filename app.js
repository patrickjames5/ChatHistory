var http = require('http'),
    https = require('https'),
    queryString = require('querystring'),
    fs = require('fs'),
    chalk = require('chalk'),
    util = require('util');
    
var config = require("./config.json");

function handleRequest(request, response){
    response.end(`
    TEST HTML
    `);
}

var server = http.createServer(handleRequest);


var offset_value = config["Offset"],
    limit_value = config["Limit"],
    fb_id = config["FriendID"];
    
var offset_key = "messages[user_ids][" + fb_id + "][offset]",
    timestamp_key = "messages[user_ids][" + fb_id + "][timestamp]",
    limit_key = "messages[user_ids][" + fb_id + "][limit]"
var postData = {
    client: 'mercury',
    __user: config["SelfID"],
    __a: '1',
    __dyn: '7AzkXh8Z0BgDxKy1l0BwRyWgS8zXrWo466EeAq68K5UdoS2qGG2qcBx-y28b9GwIKuEjxa3Kbwh8eUnBGqew',
    __req: 'p',
    fb_dtsg: 'AQFcQCPBLTTh',
    ttstamp: '26581709981678066768484104',
    __rev: '2110143'
};
postData[offset_key] = offset_value;
postData[timestamp_key] = Date.now();
postData[limit_key] = limit_value;

var headers = {
  "Origin": "https://www.messenger.com",
  "X-DevTools-Emulate-Network-Conditions-Client-Id": "50369968-E00D-48CA-AD4A-BC709EFF6085",
  "X-MSGR-Region": "X-MSGR-Region",
  "User-Agent": "ChatHistory",
  "Content-Type": "application/x-www-form-urlencoded",
  "Accept": "*/*",
  "Accept-Encoding": "gzip;q=0, deflate;q=0",
  "Accept-Language": "en-US,en;q=0.8",
  "Cookie": config["Cookie"]
};

var options = {
  hostname: 'www.messenger.com',
  port: 443,
  path: '/ajax/mercury/thread_info.php?__pc=EXP1%3Amessengerdotcom_pkg',
  method: 'POST',
  headers: headers
};

var messageList = [];

var req = https.request(options, function(res) {
    console.log("statusCode: ", res.statusCode);
    console.log("headers: ", res.headers);

    var buffer = "";
    res.setEncoding('utf8');
    res.on('data', function(d) {
        buffer += d;
    });
    res.on('end', function() {
        messageList = JSON.parse(buffer.slice(9)).payload.actions;
        for (var key in messageList) {
            var message = messageList[key];
            var date = new Date(message.timestamp);
            var day = date.getDay();
            var hour = date.getHours();         
            if (message.body) {
                console.log(chalk.yellow(new Date(message.timestamp)));
                if (message.author === "fbid:" + config["SelfID"]) {
                    console.log(chalk.red(message.body));
                } else {
                    console.log(message.body);
                }
            }
            else if (message.log_message_body) {
                console.log(chalk.yellow(message.log_message_body));
            }
            
        }
        server.listen(config["Port"], function(){
            console.log("Server listening on: http://localhost:%s", config["Port"]);
        });
    })
});

req.write(queryString.stringify(postData));
req.end();

req.on('error', function(e) {
    console.error(e);
});