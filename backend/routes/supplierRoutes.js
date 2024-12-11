const express = require('express');
const router = express.Router();
const {
  getStocks,
  getSuppliers,
  addSupplier,
  updateSupplier,
  deleteSupplier,
} = require('../controllers/supplierController');

// Routes
router.get('/stocks', getStocks); // Fetch product names and categories from 'stocks' collection
router.get('/suppliers', getSuppliers); // Fetch existing suppliers
router.post('/suppliers', addSupplier); // Add a new supplier
router.put('/suppliers/:id', updateSupplier); // Update supplier by ID
router.delete('/suppliers/:id', deleteSupplier); // Delete supplier by ID

module.exports = router;
