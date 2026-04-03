const router = require('express').Router();
const c = require('../controllers/requestController');
const { protect } = require('../middleware/auth');

router.post('/',              protect, c.sendRequest);
router.get('/my',             protect, c.getMyRequests);
router.patch('/:id/status',   protect, c.updateRequestStatus);

module.exports = router;
