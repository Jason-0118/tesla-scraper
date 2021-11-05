const mongoose = require('mongoose')
const Schema = mongoose.Schema


var VehicleSchema = new Schema({
    year: { type: Number },
    model: { type: String },
    vehicle_summary: { type: Object },
    vehicle_history: { type: Object },
    cc: { type: Array },
    safty: { type: Array },
    entertainment: { type: Array },
    ee: { type: Array },
    url: { type: String },
})


module.exports = mongoose.model('vehicle', VehicleSchema)
