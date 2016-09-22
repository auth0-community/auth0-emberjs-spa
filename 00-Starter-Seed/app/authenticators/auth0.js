import Auth0Authenticator from './Auth0Authenticator';
import config from 'simple/config/environment';

export default Auth0Authenticator.extend({
  clientId: config.Auth0.clientId,
  auth0Domain: config.Auth0.domain,
});
