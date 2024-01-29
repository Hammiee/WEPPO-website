const mongoose = require('mongoose');

const Schema =  mongoose.Schema;
const ClientSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    basket: {
        type: Schema.Types.ObjectId,
        ref: 'Basket',
        required: true
    }
});

module.exports = mongoose.model('Client', ClientSchema);