// config/passport.js
// Passport only handles the login session here (username/email + password
// sign-in calls req.login). There are no third-party sign-in strategies.
import passport from 'passport';
import User from '../models/user.model.js';

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  const user = await User.findByPk(id);
  done(null, user);
});
