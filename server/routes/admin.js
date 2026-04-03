const router = require('express').Router();
const c = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

// All admin routes require login + admin role
router.use(protect, adminOnly);

router.get('/dashboard',          c.getDashboard);
router.get('/users',              c.getAllUsers);
router.patch('/users/:id/toggle', c.toggleUserStatus);
router.get('/payments',           c.getAllPayments);

module.exports = router;
