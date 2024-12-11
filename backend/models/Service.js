// backend/models/Service.js
 const mongoose = require("mongoose");

 const serviceSchema = new mongoose.Schema({
     serviceName: { type: String, required: true },
     serviceDescription: { type: String, required: true },
     doctorName: { type: String, required: true },
     availableTimes: [
         {
             day: { type: String, required: true },
             slots: { type: String, required: true } // Single string: "09:00 AM - 12:00 PM"
         }
     ]
 });
 
 module.exports = mongoose.model("Service", serviceSchema);
 