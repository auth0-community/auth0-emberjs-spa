/* global Auth0Lock */

import Ember from 'ember';
import config from 'simple/config/environment';

const { service } = Ember.inject;

// Lock: User configurable options
const options = {
  auth: {
    params: {scope: 'openid email'},
    redirectUrl: 'http://localhost:7357/callback',
    responseType: 'token'
  }
};

var lock = new Auth0Lock(config.Auth0.clientId, config.Auth0.domain, options);

export default Ember.Component.extend({
  didRender: function() {
    this._super(...arguments);
    lock.show();
  },

  willDestroyElement: function() {
    lock.hide();
  }
});
