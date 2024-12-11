//stockRoutes
const express = require('express');
const router = express.Router();
const Stock = require('../models/Stock'); // Import the Stock model

// POST route to add a new stock
router.post('/', async (req, res) => {
  try {
    const { name, category, sku, incoming, price, stock } = req.body;

    // Validate input data
    if (!name || !category || !sku || price < 0 || stock < 0) {
      return res
        .status(400)
        .json({ message: 'Invalid stock data. Ensure all fields are filled and values are valid.' });
    }

    // Calculate value and status
    const value = price * stock;
    const status = stock <= 10 ? 'Low Stock' : 'In Stock';

    // Create a new stock document
    const newStock = new Stock({ name, category, sku, incoming, price, stock, value, status });
    const savedStock = await newStock.save();

    // Respond with the saved stock
    res.status(201).json(savedStock);
  } catch (error) {
    console.error('Error adding stock:', error.message);
    res.status(500).json({ message: 'Failed to add stock', error: error.message });
  }
});

// GET route to fetch all stocks
router.get('/', async (req, res) => {
  try {
    // Fetch all documents from the stocks collection
    const stocks = await Stock.find();
    res.status(200).json(stocks);
  } catch (error) {
    console.error('Error fetching stocks:', error.message);
    res.status(500).json({ message: 'Failed to fetch stocks', error: error.message });
  }
});

// PUT route to update an existing stock
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, sku, incoming, price, stock } = req.body;

    // Validate input data
    if (!name || !category || !sku || price < 0 || stock < 0) {
      return res
        .status(400)
        .json({ message: 'Invalid stock data. Ensure all fields are filled and values are valid.' });
    }

    // Calculate value and status
    const value = price * stock;
    const status = stock <= 10 ? 'Low Stock' : 'In Stock';

    // Find and update the stock document
    const updatedStock = await Stock.findByIdAndUpdate(
      id,
      { name, category, sku, incoming, price, stock, value, status },
      { new: true, runValidators: true } // Return the updated document and validate the data
    );

    if (!updatedStock) {
      return res.status(404).json({ message: 'Stock not found' });
    }

    res.status(200).json(updatedStock);
  } catch (error) {
    console.error('Error updating stock:', error.message);
    res.status(500).json({ message: 'Failed to update stock', error: error.message });
  }
});

// DELETE route to delete a stock
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Find and delete the stock document
    const deletedStock = await Stock.findByIdAndDelete(id);

    if (!deletedStock) {
      return res.status(404).json({ message: 'Stock not found' });
    }

    res.status(200).json({ message: 'Stock deleted successfully' });
  } catch (error) {
    console.error('Error deleting stock:', error.message);
    res.status(500).json({ message: 'Failed to delete stock', error: error.message });
  }
});

module.exports = router;
