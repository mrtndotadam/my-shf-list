const express = require('express');
const router = express.Router();
const figureController = require('../controllers/figureController');

router.get('/browse', figureController.getBrowse);
router.get('/figureForm', figureController.getFigureForm);
router.get('/figureForm/:id', figureController.getFigureForm);
router.post('/createEntry', figureController.postCreateEntry);
router.post('/editEntry/:id', figureController.postEditEntry);
router.post('/deleteEntry/:id', figureController.postDeleteEntry);
router.get('/search', figureController.getSearchFigures);

module.exports = router;