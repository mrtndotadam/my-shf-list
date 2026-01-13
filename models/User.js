const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    isAdmin: { type: Boolean, default: false },
    passwordHash: { type: String, required: true },
    userWishlist: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Figure' 
    }],
    userCollection: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Figure' 
    }]
});

module.exports = mongoose.model('User', userSchema);