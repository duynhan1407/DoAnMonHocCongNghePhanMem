const express = require('express');
const passport = require('../auth/passport');
const router = express.Router();

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/login', session: false }), (req, res) => {
  // Sau khi đăng nhập thành công, trả về access_token cho frontend
  const jwt = require('jsonwebtoken');
  const token = jwt.sign({ id: req.user._id, email: req.user.email, isAdmin: req.user.isAdmin }, process.env.ACCESS_TOKEN, { expiresIn: '1d' });
  // Lấy biến isNewUser từ user object
  const isNewUser = req.user._isNewUser ? '1' : '0';
  res.redirect(`http://localhost:3000/oauth-success?token=${token}&isNewUser=${isNewUser}`);
});

// Facebook OAuth
router.get('/facebook', passport.authenticate('facebook', { scope: ['email'] }));
router.get('/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/login', session: false }), (req, res) => {
  res.redirect('/oauth-success?provider=facebook');
});

// Google OAuth - Đăng nhập (chỉ cho phép user đã tồn tại)
router.get('/google-signin', passport.authenticate('google-signin', { scope: ['profile', 'email'] }));
router.get('/google-signin/callback', (req, res, next) => {
  passport.authenticate('google-signin', { failureRedirect: '/login', session: false }, (err, user, info) => {
    if (!user) {
      // Nếu chưa đăng ký, chuyển về frontend với thông báo lỗi
      return res.redirect('http://localhost:3000/oauth-success?error=signin_not_registered');
    }
    const jwt = require('jsonwebtoken');
    const token = jwt.sign({ id: user._id, email: user.email, isAdmin: user.isAdmin }, process.env.ACCESS_TOKEN, { expiresIn: '1d' });
    res.redirect(`http://localhost:3000/oauth-success?token=${token}&isNewUser=0`);
  })(req, res, next);
});

// Google OAuth - Đăng ký (chỉ cho phép user mới)
router.get('/google-signup', passport.authenticate('google-signup', { scope: ['profile', 'email'] }));
router.get('/google-signup/callback', (req, res, next) => {
  passport.authenticate('google-signup', { failureRedirect: '/login', session: false }, (err, user, info) => {
    if (!user) {
      // Nếu email đã tồn tại, chuyển về frontend với thông báo lỗi
      return res.redirect('http://localhost:3000/oauth-success?error=signup_email_exists');
    }
    const jwt = require('jsonwebtoken');
    const token = jwt.sign({ id: user._id, email: user.email, isAdmin: user.isAdmin }, process.env.ACCESS_TOKEN, { expiresIn: '1d' });
    res.redirect(`http://localhost:3000/oauth-success?token=${token}&isNewUser=1`);
  })(req, res, next);
});

module.exports = router;
