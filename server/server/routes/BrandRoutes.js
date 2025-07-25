const express = require('express');
const router = express.Router();
const BrandController = require('../controllers/BrandController');

router.post('/create', BrandController.createBrand);
router.get('/getAll', BrandController.getAllBrands);
router.delete('/delete/:id', BrandController.deleteBrand);
router.put('/update/:id', BrandController.updateBrand);

module.exports = router;
