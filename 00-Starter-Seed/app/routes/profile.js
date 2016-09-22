import Ember from 'ember';

export default Ember.Route.extend({
  model() {
    const profile = localStorage.getItem('profile');
    const profileObject = JSON.parse(profile);
    const model = {
      name: profileObject.name,
      nickname: profileObject.nickname,
      pictureUrl: profileObject.picture,
      email: profileObject.email,
      body: profile.trim()
    }
    return model;
  }
});
