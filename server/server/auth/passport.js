const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// Google OAuth - Đăng nhập (chỉ cho phép user đã tồn tại)
passport.use('google-signin', new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL.replace('/auth/google/callback', '/auth/google-signin/callback'),
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ email: profile.emails[0].value });
    if (!user) {
      // Không cho phép đăng nhập nếu chưa có tài khoản
      return done(null, false, { message: 'Tài khoản chưa được đăng ký.' });
    }
    if (!user.googleId) {
      user.googleId = profile.id;
      await user.save();
    }
    // Nếu là email admin nhưng user chưa có isAdmin, cập nhật luôn
    if (profile.emails[0].value === 'nhancao1103@gmail.com' && !user.isAdmin) {
      user.isAdmin = true;
      await user.save();
      // Lấy lại user mới nhất từ database
      user = await User.findById(user._id);
    }
    user._isNewUser = false;
    return done(null, user);
  } catch (err) {
    return done(err, null);
  }
}));

// Google OAuth - Đăng ký (chỉ cho phép user mới)
passport.use('google-signup', new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL.replace('/auth/google/callback', '/auth/google-signup/callback'),
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ email: profile.emails[0].value });
    if (user) {
      // Không cho phép đăng ký nếu đã có tài khoản
      return done(null, false, { message: 'Email đã tồn tại, vui lòng đăng nhập.' });
    }
    user = await User.create({
      googleId: profile.id,
      name: profile.displayName,
      email: profile.emails[0].value,
      isAdmin: (profile.emails[0].value === 'nhancao1103@gmail.com') // true nếu là email admin
    });
    user._isNewUser = true;
    return done(null, user);
  } catch (err) {
    return done(err, null);
  }
}));

// Đã xóa Facebook OAuth

module.exports = passport;
