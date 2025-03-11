const express = require('express');
const router = express.Router();
const {
    registerConsumer,
    loginConsumer,
    getConsumers,
    getConsumerProfile,
    updateConsumerProfile,
    forgotPassword,
    resetPassword
} = require('../controllers/consumerController');

const { authenticate } = require('../middleware/authMiddleware');

// ✅ Debugging Logs
console.log("registerConsumer:", registerConsumer);
console.log("loginConsumer:", loginConsumer);
console.log("getConsumers:", getConsumers);
console.log("getConsumerProfile:", getConsumerProfile);
console.log("updateConsumerProfile:", updateConsumerProfile);

// ✅ Routes
router.post('/signup', registerConsumer);
router.post('/login', loginConsumer);
router.get('/profile/:userId', getConsumerProfile);
router.put('/update-profile/:userId', updateConsumerProfile);
router.get('/list', getConsumers); // ✅ Fetch Consumers Route
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

module.exports = router;