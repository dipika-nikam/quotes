const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authToken')
const UserRoutes = require('../controllers/userController');

router.post('/register', UserRoutes.userRegister);
router.post('/login', UserRoutes.userLogin);
router.post('/password/link', UserRoutes.forgotPasswordlink)
router.post('/logout',verifyToken, UserRoutes.userLogout);
router.put('/user/update',verifyToken, UserRoutes.updatedUser);
router.post('/change/password',verifyToken, UserRoutes.forgotPassword);

module.exports = router;
