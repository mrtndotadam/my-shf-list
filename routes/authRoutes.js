const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.get('/signup', authController.getSignup);
router.post('/signup', authController.postSignup);
router.get('/login', authController.getLogin);
router.post('/login', authController.postLogin);
router.post('/logout', authController.postLogout);
router.get('/profile', authController.getProfile);
router.get('/editUser/:action', authController.getEditUser);
router.post('/changeEmail', authController.postChangeEmail);
router.post('/changePassword', authController.postChangePassword);
router.post('/deleteUser', authController.postDeleteUser);

module.exports = router;