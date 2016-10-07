/* jshint node: true */

var auth0 = require('./auth0-variables');

module.exports = function(environment) {
  var ENV = {
    modulePrefix: 'simple',
    environment: environment,
    rootURL: '/',
    locationType: 'auto',
    EmberENV: {
      FEATURES: {
        // Here you can enable experimental features on an ember canary build
        // e.g. 'with-controller': true
      },
      EXTEND_PROTOTYPES: {
        Date: false,
      }
    },

    APP: {
      // Here you can pass flags/options to your application instance
      // when it is created
    },

    Auth0: {
      clientId: auth0.AUTH0_CLIENT_ID,
      domain: auth0.AUTH0_DOMAIN,
      callbackUrl: 'http://localhost:7357/callback',
    }
  };

  if (environment === 'development') {
    // ENV.APP.LOG_RESOLVER = true;
    // ENV.APP.LOG_ACTIVE_GENERATION = true;
    ENV.APP.LOG_TRANSITIONS = true;
    // ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
    // ENV.APP.LOG_VIEW_LOOKUPS = true;
  }

  if (environment === 'test') {
    // Testem prefers this...
    ENV.rootURL = '/';
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
    clientID: auth0.AUTH0_CLIENT_ID,
    domain: auth0.AUTH0_DOMAIN
  }

  ENV['contentSecurityPolicy'] = {
    'font-src': "'self' data: https://*.auth0.com https://maxcdn.bootstrapcdn.com https://fonts.typekit.net http://cdn.auth0.com/",
    'style-src': "'self' 'unsafe-inline' http://use.typekit.net https://maxcdn.bootstrapcdn.com",
    'script-src': "'self' 'unsafe-eval' 'unsafe-inline' https://*.auth0.com https://use.typekit.net",
    'img-src': 'https://www.gravatar.com *.wp.com data: http://p.typekit.net http://localhost:*/auth0.png http://localhost:7357/favicon.ico',
    'connect-src': "'self' http://localhost:* https://samples.auth0.com"
  };

  return ENV;
};
