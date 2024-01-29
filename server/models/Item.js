const mongoose = require('mongoose');

const Schema =  mongoose.Schema;
const ItemSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    body: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        default: 0
    }
});

module.exports = mongoose.model('Item', ItemSchema);