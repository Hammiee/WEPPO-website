const mongoose = require('mongoose');

const Schema =  mongoose.Schema;
const BasketSchema = new Schema({
    items: [{
        item: { type: Schema.Types.ObjectId, ref: 'Item'},
        quantity: Number
    }],
    ordered: {
        type: Boolean,
        required: true
    }
});

module.exports = mongoose.model('Basket', BasketSchema);