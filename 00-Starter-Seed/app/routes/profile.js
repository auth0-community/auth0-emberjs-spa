import Ember from 'ember';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default Ember.Route.extend(AuthenticatedRouteMixin, {
  model() {
    const profile = localStorage.getItem('profile');
    const profileObject = JSON.parse(profile);
    const model = {
      name: profileObject.name,
      nickname: profileObject.nickname,
      pictureUrl: profileObject.picture,
      email: profileObject.email,
      body: profile.trim()
    };
    return model;
  }
});
