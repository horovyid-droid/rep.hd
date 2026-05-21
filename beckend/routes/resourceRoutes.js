const express = require('express');
const router = express.Router();


const resourceController = require('../controllers/resourceController');


router.get('/count', resourceController.getCount);


router.get('/', resourceController.getAll);
router.get('/:id', resourceController.getById);
router.post('/', resourceController.create);
router.put('/:id', resourceController.update);
router.delete('/:id', resourceController.delete);


module.exports = router;