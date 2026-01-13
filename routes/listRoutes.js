const express = require('express');
const router = express.Router();
const listController = require('../controllers/listController');

router.get('/lists', listController.getLists);
router.post('/addToCollection/:id', listController.addToCollection);
router.post('/addToWishlist/:id', listController.addToWishlist);
router.post('/moveToCollection/:id', listController.moveToCollection);
router.post('/removeFromCollection/:id', listController.removeFromCollection);
router.post('/removeFromWishlist/:id', listController.removeFromWishlist);

module.exports = router;