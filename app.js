var fs = require('fs');
var Path = require('path')
var Hapi = require('hapi');
var inert = require('inert');

var siteData = require('./data/siteData.js');

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

  server.route({
    method: 'GET',
    path: '/siteData',
    handler: function(request, reply) {
      return reply(fs.readFileSync('data/siteData.json'));
    }
  });

  server.route({
    method: 'POST',
    path: '/siteData',
    handler: function(request, reply) {
      fs.writeFile('data/siteData.json', request.payload);
      return reply('data saved');
    }
  });

  server.start((err) => {
    if (err) throw err;

    console.log('Server running at:', server.info.uri);
  });
})
