const express = require('express');
const {
  getUsers,
  updateUserRole,
  deleteUser
} = require('../controllers/userController');

const router = express.Router();

const { protect, admin, superAdmin } = require('../middleware/authMiddleware');

router.use(protect);
router.use(superAdmin);

router.route('/')
  .get(getUsers);

router.route('/:id')
  .delete(deleteUser);

router.route('/:id/role')
  .patch(updateUserRole);

module.exports = router;
