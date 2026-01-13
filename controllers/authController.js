const User = require('../models/User');
const bcrypt = require('bcrypt');

exports.getSignup = (req, res) => {
    res.render('signup');
}

exports.postSignup = async (req, res) => {
    try {
        const { email, password, confirmPassword } = req.body;
        const existingUser = await User.findOne({ email: email.toLowerCase() });

        if (existingUser) {
            return res.status(400).send('Email already in use');
        }

        if (password !== confirmPassword) {
            return res.status(400).send('Passwords do not match');
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            email: email.toLowerCase(),
            passwordHash: hashedPassword,
            isAdmin: false,
            userCollection: [],
            userWishlist: []
        });

        await newUser.save();
        console.log('New user registered:', newUser.email);
        res.redirect('/login');
    } catch (error) {
        console.error('Error during signup:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.getLogin = (req, res) => {
    res.render('login');
}

exports.postLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email: email.toLowerCase() });

        if (user && await bcrypt.compare(password, user.passwordHash)) {
            req.session.user = {
                _id: user._id,
                email: user.email,
                isAdmin: user.isAdmin
            };
            console.log('User logged in:', user.email);
            res.redirect('/browse');
        } else {
            res.status(401).send('Invalid email or password');
        }
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.postLogout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error during logout:', err);
            return res.status(500).send('Internal Server Error');
        }
        console.log('User logged out');
        res.redirect('/login');
    });
};

exports.getProfile = async (req, res) => {
    try {
        if (!req.session.user) {
            return res.redirect('/login');
        }
        const user = await User.findById(req.session.user._id);
        res.render('profile', { user });
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.getEditUser  = (req, res) => {
    try {
        if (!req.session.user) {
            return res.redirect('/login');
        }
        const action = req.params.action;
        res.render('editUser', { 
            user: req.session.user, 
            action: action 
        });
    } catch (error) {
        console.error('Error rendering edit user page:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.postChangeEmail = async (req, res) => {
    try {
        if (!req.session.user) {
            return res.redirect('/login');
        }

        const { old_email, new_email, password } = req.body;
        const userId = req.session.user._id;

        const user = await User.findById(userId);

        if (user.email !== old_email.toLowerCase()) {
            return res.status(400).send('Old email does not match');
        }

        if (!await bcrypt.compare(password, user.passwordHash)) {
            return res.status(401).send('Incorrect password');
        }

        if (new_email.toLowerCase() === old_email.toLowerCase()) {
            return res.status(400).send('New email must be different from old email');
        }

        const emailExists = await User.findOne({ email: new_email.toLowerCase() });
        if (emailExists) {
            return res.status(400).send('Email already in use');
        }

        user.email = new_email.toLowerCase();
        await user.save();

        req.session.user.email = user.email;
        console.log('User email changed to:', user.email);
        res.redirect('/profile');
    } catch (error) {
        console.error('Error changing email:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.postChangePassword = async (req, res) => {
    try {
        if (!req.session.user) {
            return res.redirect('/login');
        }

        const { old_password, new_password } = req.body;
        const userId = req.session.user._id;

        const user = await User.findById(userId);

        if (!await bcrypt.compare(old_password, user.passwordHash)) {
            return res.status(401).send('Incorrect old password');
        }

        user.passwordHash = await bcrypt.hash(new_password, 10);
        await user.save();

        console.log('User password changed for:', user.email);
        res.redirect('/profile');
    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.postDeleteUser = async (req, res) => {
    try {
        if (!req.session.user) {
            return res.redirect('/login');
        }
        const { old_password } = req.body;
        const user = await User.findById(req.session.user._id);

        if (!await bcrypt.compare(old_password, user.passwordHash)) {
            return res.status(401).send('Incorrect password');
        }

        await User.findByIdAndDelete(req.session.user._id);

        req.session.destroy((err) => {
            if (err) {
                console.error('Error during session destruction after account deletion:', err);
                return res.status(500).send('Internal Server Error');
            }

            res.clearCookie('connect.sid');
            console.log('User account deleted:', user.email);
            res.redirect('/signup');
        });

    } catch (error) {
        console.error('Error deleting account:', error);
        res.status(500).send('Internal Server Error');
    }
};