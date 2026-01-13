const Figure = require('../models/Figure');
const User = require('../models/User');

exports.getLists = async (req, res) => {
    try {
        if (!req.session.user) {
            return res.redirect('/login');
        }

        // Fetch user figures with populated lists
        const userFigures = await User.findById(req.session.user._id)
            .populate('userCollection')
            .populate('userWishlist')
            .exec();

        res.render('lists', { 
            user: req.session.user, 
            collection: userFigures.userCollection,
            wishlist: userFigures.userWishlist
        });
    } catch (error) {
        console.error('Error fetching user lists:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.addToCollection = async (req, res) => {
    try {
        if (!req.session.user) {
            return res.redirect('/login');
        }

        await User.findByIdAndUpdate(
            req.session.user._id,
            { $addToSet: { userCollection: req.params.id } }
        );
        console.log('Added to collection:', req.params.id);
        res.redirect(req.get('referer'));
    } catch (error) {
        console.error('Error adding to collection:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.addToWishlist = async (req, res) => {
    try {
        if (!req.session.user) {
            return res.redirect('/login');
            // return res.status(401).json({ message: 'Please log in first' });
        }

        await User.findByIdAndUpdate(
            req.session.user._id,
            { $addToSet: { userWishlist: req.params.id } }
        );

        console.log('Added to wishlist:', req.params.id);
        res.redirect(req.get('referer'));
        // res.status(200).json({ success: true, message: 'Added to wishlist' });
    } catch (error) {
        console.error('Error adding to wishlist:', error);
        res.status(500).send('Internal Server Error');
        // res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

exports.moveToCollection = async (req, res) => {
    try {
        if (!req.session.user) {
            return res.redirect('/login');
        }

        await User.findByIdAndUpdate(
            req.session.user._id,
            {
                $pull: { userWishlist: req.params.id },
                $addToSet: { userCollection: req.params.id }
            }
        );
        console.log('Moved from wishlist to collection:', req.params.id);
        res.redirect(req.get('referer'));
    } catch (error) {
        console.error('Error moving from wishlist to collection:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.removeFromCollection = async (req, res) => {
    try {
        if (!req.session.user) {
            return res.redirect('/login');
        }

        await User.findByIdAndUpdate(
            req.session.user._id,
            { $pull: { userCollection: req.params.id } }
        );
        console.log('Removed from collection:', req.params.id);
        res.redirect(req.get('referer'));
    } catch (error) {
        console.error('Error removing from collection:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.removeFromWishlist = async (req, res) => {
    try {
        if (!req.session.user) {
            return res.redirect('/login');
        }

        await User.findByIdAndUpdate(
            req.session.user._id,
            { $pull: { userWishlist: req.params.id } }
        );
        console.log('Removed from wishlist:', req.params.id);
        res.redirect(req.get('referer'));
    } catch (error) {
        console.error('Error removing from wishlist:', error);
        res.status(500).send('Internal Server Error');
    }
};