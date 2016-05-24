/* jshint node: true */

var auth0Config = require('./auth0-variables');

module.exports = function(environment) {
  var ENV = {
    modulePrefix: 'simple',
    environment: environment,
    baseURL: '/',
    locationType: 'auto',
    EmberENV: {
      FEATURES: {
        // Here you can enable experimental features on an ember canary build
        // e.g. 'with-controller': true
      }
    },

    APP: {
      // Here you can pass flags/options to your application instance
      // when it is created
    }
  };

  if (environment === 'development') {
    // ENV.APP.LOG_RESOLVER = true;
    // ENV.APP.LOG_ACTIVE_GENERATION = true;
    // ENV.APP.LOG_TRANSITIONS = true;
    // ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
    // ENV.APP.LOG_VIEW_LOOKUPS = true;
  }

  if (environment === 'test') {
    // Testem prefers this...
    ENV.baseURL = '/';
    ENV.locationType = 'none';

    // keep test console output quieter
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;

    ENV.APP.rootElement = '#ember-testing';
  }

  if (environment === 'production') {

  }

  ENV['simple-auth'] = {
    authenticationRoute: 'index',
    routeAfterAuthentication: 'protected',
    routeIfAlreadyAuthenticated: 'protected'
  }

  ENV['auth0-ember-simple-auth'] = {
    clientID: auth0Config.AUTH0_CLIENT_ID,
    domain: auth0Config.AUTH0_DOMAIN
  }

  ENV['contentSecurityPolicy'] = {
    'font-src': "'self' data: https://*.auth0.com https://maxcdn.bootstrapcdn.com",
    'style-src': "'self' 'unsafe-inline' http://use.typekit.net https://maxcdn.bootstrapcdn.com",
    'script-src': "'self' 'unsafe-eval' 'unsafe-inline' https://*.auth0.com https://use.typekit.net",
    'img-src': 'https://www.gravatar.com *.wp.com data: http://p.typekit.net',
    'connect-src': "'self' http://localhost:* https://samples.auth0.com"
  };

  return ENV;
};
