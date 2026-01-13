const mongoose = require('mongoose');

const figureSchema = new mongoose.Schema({
    titleIP: { type: String, required: true, index: true },     // e.g., "Naruto", "One Piece", "Dragon Ball"
    name: { type: String, required: true },                     // e.g., "Super Saiyan 4 Goku Son Goku"
    releaseYear: { type: Number, required: true },              // e.g., 2022
    imageURL: { type: String, required: true }
});

module.exports = mongoose.model('Figure', figureSchema);