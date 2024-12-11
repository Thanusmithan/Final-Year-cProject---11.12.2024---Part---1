const Stock = require('../models/Stock');
//stockController.js
exports.getAllStocks = async (req, res) => {
  try {
    const stocks = await Stock.find();
    res.json(stocks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.addStock = async (req, res) => {
  try {
    const { name, category, sku, incoming, price, stock } = req.body;
    const value = price * stock;
    const status = stock <= 10 ? 'Low Stock' : 'In Stock';

    const newStock = new Stock({ name, category, sku, incoming, price, stock, value, status });
    const savedStock = await newStock.save();
    res.status(201).json(savedStock);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


exports.updateStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, sku, incoming, price, stock } = req.body;
    const value = price * stock;
    const status = stock <= 10 ? 'Low Stock' : 'In Stock';

    const updatedStock = await Stock.findByIdAndUpdate(
      id,
      { name, category, sku, incoming, price, stock, value, status },
      { new: true }
    );

    res.json(updatedStock);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a stock
exports.deleteStock = async (req, res) => {
  try {
    const { id } = req.params;
    await Stock.findByIdAndDelete(id);
    res.json({ message: 'Stock deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
