const express = require('express');
const router = express.Router();
const pesananGalonController = require('../controllers/pesananGalonController');
const cekApiKey = require('../middlewares/cekApiKey');

router.get('/', pesananGalonController.getAll);
router.get('/:id', pesananGalonController.getById);
router.post('/', cekApiKey, pesananGalonController.create);
router.put('/:id', cekApiKey, pesananGalonController.update);
router.delete('/:id', cekApiKey, pesananGalonController.remove);

module.exports = router;
