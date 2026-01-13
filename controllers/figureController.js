const Figure = require('../models/Figure');
const User = require('../models/User');

exports.getBrowse = async (req, res) => {
    try {
        // Fetch all figures from the database
        const allFigures = await Figure.find({}).sort({
            titleIP: 1,
            releaseYear: -1
        });

        // Fetch the current user's collection and wishlist IDs for easy lookup
        let userCollectionIds = [];
        let userWishlistIds = [];

        // If user is logged in, get their collection and wishlist
        if (req.session.user) {
            const user = await User.findById(req.session.user._id);
            if (user) {
                userCollectionIds = user.userCollection.map(id => id.toString());
                userWishlistIds = user.userWishlist.map(id => id.toString());
            }
        }

        // Group figures by titleIP
        const groupedFigures = allFigures.reduce((acc, figure) => {
            const title = figure.titleIP;

            figure.isInCollection = userCollectionIds.includes(figure._id.toString());
            figure.isInWishlist = userWishlistIds.includes(figure._id.toString());

            if (!acc[title]) {
                acc[title] = [];
            }
            acc[title].push(figure);
            return acc;
        }, {});

        res.render('browse', { 
            user: req.session.user, 
            groupedFigures,
            userCollectionIds,
            userWishlistIds
        });
    } catch (error) {
        console.error('Error fetching figures:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.getFigureForm = async (req, res) => {
    try {
        if (!req.session.user.isAdmin) {
            return res.status(403).send('Admin access required');
        }

        const figureId = req.params.id;
        let figure = null;

        if (figureId) {
            figure = await Figure.findById(figureId);
        }

        const existingIPs = await Figure.distinct('titleIP');

        res.render('figureForm', {
            user: req.session.user,
            figure,
            existingIPs
        });
    } catch (error) {
        console.error('Error loading figure form:', error);
        res.status(500).send('Internal Server Error');
    }   
};

exports.postCreateEntry = async (req, res) => {
    try {
        if (!req.session.user.isAdmin) {
            return res.status(403).send('Admin access required');
        }
        const { titleIP, name, releaseYear, imageURL } = req.body;

        const existingFigure = await Figure.findOne({
            titleIP: { $regex: new RegExp(`^${titleIP}$`, 'i') },
            name: { $regex: new RegExp(`^${name}$`, 'i') }
        });

        if (existingFigure) {
            return res.status(400).send('Figure already exists');
        }

        const newFigure = new Figure({
            titleIP,
            name,
            releaseYear,
            imageURL
        });

        await newFigure.save();

        console.log('New figure created:', newFigure);
        res.redirect('/browse');

    } catch (error) {
        console.error('Error creating figure:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.postEditEntry = async (req, res) => {
    try {
        if (!req.session.user.isAdmin) {
            return res.status(403).send('Admin access required');
        }

        const { titleIP, name, releaseYear, imageURL } = req.body;
        const figureId = req.params.id;
        
        const existingFigure = await Figure.findOne({
            _id: { $ne: figureId },
            titleIP: { $regex: new RegExp(`^${titleIP}$`, 'i') },
            name: { $regex: new RegExp(`^${name}$`, 'i') }
        });

        if (existingFigure) {
            return res.status(400).send('Figure already exists');
        }

        await Figure.findByIdAndUpdate(req.params.id, {
            titleIP,
            name,
            releaseYear,
            imageURL
        });

        // await Figure.findByIdAndUpdate(req.params.id, req.body);
        console.log('Figure updated:', req.params.id);
        res.redirect('/browse');
    } catch (error) {
        console.error('Error updating figure:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.postDeleteEntry = async (req, res) => {
    try {
        if (!req.session.user.isAdmin) {
            return res.status(403).send('Admin access required');
        }

        await Figure.findByIdAndDelete(req.params.id);
        console.log('Figure deleted:', req.params.id);
        res.redirect('/browse');
    } catch (error) {
        console.error('Error deleting figure:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.getSearchFigures = async (req, res) => {
    try {
        const query = req.query.q;

        if (!query) {
            return res.redirect('/browse');
        }

        const searchResults = await Figure.find({
            $or: [
                { titleIP: { $regex: query, $options: 'i' } },
                { name: { $regex: query, $options: 'i' } }
            ]
        }).sort({
            titleIP: 1,
            releaseYear: -1
        });

        let userCollectionIds = [];
        let userWishlistIds = [];

        if (req.session.user) {
            const user = await User.findById(req.session.user._id);
            if (user) {
                userCollectionIds = user.userCollection.map(id => id.toString());
                userWishlistIds = user.userWishlist.map(id => id.toString());
            }
        }

        searchResults.forEach(figure => {
            const idStr = figure._id.toString();
            figure.isInCollection = userCollectionIds.includes(idStr);
            figure.isInWishlist = userWishlistIds.includes(idStr);
        });

        res.render('search', { 
            user: req.session.user, 
            searchResults,
            query
        });
    } catch (error) {
        console.error('Error searching figures:', error);
        res.status(500).send('Internal Server Error');
    }
};