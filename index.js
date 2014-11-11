'use strict';
var https = require('https');
var fs = require('fs');
var cors = require('cors');
var onHeaders = require('on-headers');


process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0" // Avoids DEPTH_ZERO_SELF_SIGNED_CERT error for self-signed certs

module.exports = {
  name: 'https-server',
  dynamicScript: function(request) {
    var liveReloadPort = process.env.EMBER_CLI_INJECT_LIVE_RELOAD_PORT;

    return "(function() {\n " +
           "var src = 'http://' + (location.hostname || 'localhost') + ':" + liveReloadPort + "/livereload.js?snipver=1';\n " +
           "var script    = document.createElement('script');\n " +
           "script.type   = 'text/javascript';\n " +
           "script.src    = src;\n " +
           "document.getElementsByTagName('head')[0].appendChild(script);\n" +
           "}());";
  },
  // contentFor: function(type) {
  //   var liveReloadPort = process.env.EMBER_CLI_INJECT_LIVE_RELOAD_PORT;

  //   if (liveReloadPort && type === 'head') {
  //     return '<script src="/ember-cli-live-reload-http.js" type="text/javascript"></script>';
  //   }
  // },

  serverMiddleware: function(config) {
    var app = config.app;
    var self = this;
    var options = config.options;
    var corsOptions = {
      origin: true,
      credentials: true,
      maxAge:0,
    }

    app.options('*', cors(corsOptions));
    app.use(cors(corsOptions));
    // app.use(function (req, res, next){
    //   if(!req.is('application/*') && req.is('html')) {
    //     next();
    //     return; 
    //   }
    //   onHeaders(res, function () {
    //      console.log("CORS Request: " + req.path);
    //      console.log("CORS Allowed: " + res.get("access-control-allow-origin"));
    //   })
    //   next();
    // });

    process.env.EMBER_CLI_INJECT_LIVE_RELOAD_PORT = options.liveReloadPort;
    // app.use('/ember-cli-live-reload-http.js', function(request, response, next) {
    //   response.contentType('text/javascript');
    //   response.send(self.dynamicScript());
    // });
   	var httpsApp =  https.createServer({
    	key: fs.readFileSync(__dirname + '/certificate/private.key'),
  		cert: fs.readFileSync(__dirname + '/certificate/self.cert')
    }, app).listen(options.httpsPort || 443,function (){
      console.log("Proxying HTTPS on port: " + (options.httpsPort || 443) )
    });
    
  }
};
