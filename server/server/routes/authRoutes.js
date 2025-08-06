const express = require('express');
const passport = require('../auth/passport');
const router = express.Router();


// Google OAuth: tự động tạo tài khoản nếu chưa có
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/login', session: false }), (req, res) => {
  const jwt = require('jsonwebtoken');
  const token = jwt.sign({ id: req.user._id, email: req.user.email, isAdmin: req.user.isAdmin }, process.env.ACCESS_TOKEN, { expiresIn: '1d' });
  res.redirect(`${process.env.FRONTEND_URL}/oauth-success?token=${token}`);
});

module.exports = router;
