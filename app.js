var Fs = require('fs');
var Path = require('path')
var Hapi = require('hapi');
var inert = require('inert');

// var compy = require('./lib/compy/compy.js');
// var siteData = JSON.parse(Fs.readFileSync('./data/siteData.json'));

// console.log(compy);
//
// var site = compy.createPage(siteData);
// Fs.writeFileSync('public/index.html', site);

var server = new Hapi.Server();
server.connection({ port: 3000 });

server.register(inert, err => {
  if (err) throw err;

  server.route({
    method: 'GET',
    path: '/{param*}',
    handler: {
      directory: {
        path: 'public',
        listing: true
      }
    }
  });

  server.route({
    method: 'GET',
    path: '/data/{param*}',
    handler: {
      directory: {
        path: 'data',
      }
    }
  });

  server.start((err) => {
    if (err) throw err;

    console.log('Server running at:', server.info.uri);
  });
})
