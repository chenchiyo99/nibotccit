var express        = require('express'),
    bodyParser     = require('body-parser'),
    http           = require('http'),
    request        = require('request'),
    app            = express();
var token= "EAAknBKKn5usBANfOG5jBl3UTHwZCV5wVZBM1NGdodvmiE3yZA5oyRlhHuZC68UHwEYh4QDCaEuKY3fCUULrfhYhTyn3V40Sq1TvJ0WV4tPJYtJPFzNmxnj6xRBJNjZB0P52t8KZB6VpxIllQLr5zNnrPoEGkGV18TQXRGR6UrE9O9qdipWSzod"

app.use(bodyParser.json({}));

// set port
app.set('port', process.env.PORT || 8080);

// create a health check endpoint
app.get('/health', function(req, res) {
  res.send('okay');
});

app.post('/fb', function(req, res){
  console.log(JSON.stringify(req.body))
  app.messageHandler(req.body, function(result){
    console.log("Async Handled: " + result)
  })
  res.send(req.body)
})

// start the server
http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

app.get('/fb', function(req, res) {
  if (req.query['hub.verify_token'] === 'abc') {
     res.send(req.query['hub.challenge']);
   } else {
     res.send('Error, wrong validation token');
   }
});

app.messageHandler = function(j, cb) {
  var data = {
    "recipient":{
    	"id":j.entry[0].messaging[0].sender.id
    },
    "message":{
    	"text":j.entry[0].messaging[0].message.text
    }
  };
  var reqObj = {
    url: 'https://graph.facebook.com/v2.6/me/messages',
    qs: {access_token:token},
    method: 'POST',
    json: data
  };
  console.log(JSON.stringify(reqObj))
  request(reqObj, function(error, response, body) {
    if (error) {
      console.log('Error sending message: ', JSON.stringify(error));
      cb(false)
    } else if (response.body.error) {
      console.log("API Error: " + JSON.stringify(response.body.error));
      cb(false)
    } else{
      cb(true)
    }
  });
}