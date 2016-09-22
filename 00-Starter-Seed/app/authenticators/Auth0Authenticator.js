/* jscs:disable requireDotNotation */
/* global Auth0Lock */
import Ember from 'ember';
import BaseAuthenticator from 'ember-simple-auth/authenticators/base';

const { RSVP, isEmpty, run, computed } = Ember;
const assign = Ember.assign || Ember.merge;

/**
  Authenticator for Auth0

  This authenticator also automatically refreshes access tokens (see
  [RFC 6749, section 6](http://tools.ietf.org/html/rfc6749#section-6)) if the
  server supports it.

  @class Auth0Authenticator
  @extends BaseAuthenticator
  @public
*/
export default BaseAuthenticator.extend({
  /**
    Triggered when the authenticator refreshed the access token (see
    [RFC 6749, section 6](http://tools.ietf.org/html/rfc6749#section-6)).

    @event sessionDataUpdated
    @param {Object} data The updated session data
    @public
  */

  /**
    The client_id of your application.

    @property clientId
    @type String
    @default null
    @public
  */
  clientId: null,

  /**
    The auth0Domain of your account.

    @property auth0Domain
    @type String
    @default null
    @public
  */
  auth0Domain: null,

  /**
    Sets whether the authenticator automatically refreshes access tokens if the
    server supports it.

    @property refreshAccessTokens
    @type Boolean
    @default true
    @public
  */
  refreshAccessTokens: true,

  /**
    The offset time in milliseconds to refresh the access token. This must
    return a random number. This randomization is needed because in case of
    multiple tabs, we need to prevent the tabs from sending refresh token
    request at the same exact moment.

    __When overriding this property, make sure to mark the overridden property
    as volatile so it will actually have a different value each time it is
    accessed.__

    @property refreshAccessTokens
    @type Integer
    @default a random number between 5 and 10
    @public
  */
  tokenRefreshOffset: computed(function() {
    const min = 5;
    const max = 10;

    return (Math.floor(Math.random() * min) + (max - min)) * 1000;
  }).volatile(),

  _refreshTokenTimeout: null,

  /**
    Restores the session from a session data object; __will return a resolving
    promise when there is a non-empty `access_token` in the session data__ and
    a rejecting promise otherwise.

    If the server issues
    [expiring access tokens](https://tools.ietf.org/html/rfc6749#section-5.1)
    and there is an expired access token in the session data along with a
    refresh token, the authenticator will try to refresh the access token and
    return a promise that resolves with the new access token if the refresh was
    successful. If there is no refresh token or the token refresh is not
    successful, a rejecting promise will be returned.

    @method restore
    @param {Object} data The data to restore the session from
    @return {Ember.RSVP.Promise} A promise that when it resolves results in the session becoming or remaining authenticated
    @public
  */
  restore(data) {
    return new RSVP.Promise((resolve, reject) => {
      const now                 = (new Date()).getTime();
      const refreshAccessTokens = this.get('refreshAccessTokens');
      if (!isEmpty(data['expires_at']) && data['expires_at'] < now) {
        if (refreshAccessTokens) {
          this._refreshAccessToken(data['expires_in'], data['refresh_token']).then(resolve, reject);
        } else {
          reject();
        }
      } else {
        if (isEmpty(data['accessToken'])) {
          reject();
        } else {
          // this._scheduleAccessTokenRefresh(data['expires_in'], data['expires_at'], data['refresh_token']);
          resolve(data);
        }
      }
    });
  },

  /**
    Authenticates the session

    @method authenticate
    @param {String} hash The callback url hash
    @return {Ember.RSVP.Promise} A promise that when it resolves results in the session becoming authenticated
    @public
  */
  authenticate(hash) {
    var that = this;
    return new RSVP.Promise((resolve, reject) => {
      var lock = new Auth0Lock(that.clientId, that.auth0Domain);
      lock.on("authenticated", function(authResult) {
        // Use the token in authResult to getProfile() and save it to localStorage
        lock.getProfile(authResult.idToken, function(error, profile) {
          if (error) {
            reject(error);
          }
          const expiresAt = that._absolutizeExpirationTime(authResult.idTokenPayload.exp);
          that._scheduleAccessTokenRefresh(authResult.idTokenPayload.exp,
                                           expiresAt,
                                           authResult.refreshToken);

          localStorage.setItem('token', authResult.idToken);
          localStorage.setItem('profile', JSON.stringify(profile, null, ' '));

          resolve(authResult);

        });
      });
    });
  },

  /**
    Returns a resolving promise.

    @method invalidate
    @param {Object} data The current authenticated session data
    @return {Ember.RSVP.Promise} A promise that when it resolves results in the session being invalidated
    @public
  */
  invalidate(data) {
    return new RSVP.Promise((resolve) => {
      run.cancel(this._refreshTokenTimeout);
      delete this._refreshTokenTimeout;
      resolve();
    });
  },

  /**
    Makes a request to the OAuth 2.0 server.

    @method makeRequest
    @param {String} url The request URL
    @param {Object} data The request data
    @return {jQuery.Deferred} A promise like jQuery.Deferred as returned by `$.ajax`
    @protected
  */
  makeRequest(url, data) {
    const options = {
      url,
      data,
      type:        'POST',
      dataType:    'json',
      contentType: 'application/json'
    };

    return Ember.$.ajax(options);
  },

  _scheduleAccessTokenRefresh(expiresIn, expiresAt, refreshToken) {
    const refreshAccessTokens = this.get('refreshAccessTokens');
    if (refreshAccessTokens) {
      const now = (new Date()).getTime();
      if (isEmpty(expiresAt) && !isEmpty(expiresIn)) {
        expiresAt = new Date(now + expiresIn * 1000).getTime();
      }
      const offset = this.get('tokenRefreshOffset');
      if (!isEmpty(refreshToken) && !isEmpty(expiresAt) && expiresAt > now - offset) {
        run.cancel(this._refreshTokenTimeout);
        delete this._refreshTokenTimeout;
        if (!Ember.testing) {
          this._refreshTokenTimeout = run.later(this, this._refreshAccessToken, expiresIn, refreshToken, expiresAt - now - offset);
        }
      }
    }
  },

  _refreshAccessToken(expiresIn, refreshToken) {
    const data                = {
        'client_id': this.get('clientId'),
        'grant_type': 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        'refresh_token': refreshToken,
        'api_type': 'app'
      };
    const serverTokenEndpoint = this.get('serverTokenEndpoint');
    return new RSVP.Promise((resolve, reject) => {
      this.makeRequest(serverTokenEndpoint, data).then((response) => {
        run(() => {
          expiresIn       = response['expires_in'] || expiresIn;
          refreshToken    = response['refresh_token'] || refreshToken;
          const expiresAt = this._absolutizeExpirationTime(expiresIn);
          const data      = assign(response, { 'expires_in': expiresIn, 'expires_at': expiresAt, 'refresh_token': refreshToken });
          this._scheduleAccessTokenRefresh(expiresIn, null, refreshToken);
          this.trigger('sessionDataUpdated', data);
          resolve(data);
        });
      }, (xhr, status, error) => {
        Ember.Logger.warn(`Access token could not be refreshed - server responded with ${error}.`);
        reject();
      });
    });
  },

  _absolutizeExpirationTime(expiresIn) {
    if (!isEmpty(expiresIn)) {
      return new Date((new Date().getTime()) + expiresIn * 1000).getTime();
    }
  }
});
