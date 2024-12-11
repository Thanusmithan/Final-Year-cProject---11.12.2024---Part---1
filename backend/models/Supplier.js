//models/supplier.js
const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: [true, 'Supplier name is required'], 
      trim: true 
    },
    contact: { 
      type: String, 
      required: [true, 'Contact number is required'], 
      match: [/^\d{10}$/, 'Contact number must be a valid 10-digit number'], 
      trim: true 
    },
    email: { 
      type: String, 
      required: [true, 'Email is required'], 
      match: [/^\S+@\S+\.\S+$/, 'Invalid email address'], 
      trim: true, 
      lowercase: true 
    },
    address: { 
      type: String, 
      required: [true, 'Address is required'], 
      trim: true 
    },
    productName: { 
      type: String, 
      required: [true, 'Product name is required'], 
      trim: true 
    },
    category: { 
      type: String, 
      required: [true, 'Category is required'], 
      trim: true 
    },
    status: { 
      type: String, 
      enum: ['active', 'inactive'], 
      default: 'active' 
    },
  },
  { 
    timestamps: true 
  }
);

supplierSchema.pre('save', function (next) {
  if (this.contact) {
    this.contact = this.contact.trim();
  }
  next();
});

module.exports = mongoose.model('Supplier', supplierSchema);
