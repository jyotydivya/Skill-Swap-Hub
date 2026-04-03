const router = require('express').Router();
const c = require('../controllers/skillController');
const { protect } = require('../middleware/auth');

router.get('/',     c.getAllSkills);
router.get('/:id',  c.getSkillById);
router.post('/',    protect, c.createSkill);
router.put('/:id',  protect, c.updateSkill);
router.delete('/:id', protect, c.deleteSkill);

module.exports = router;
