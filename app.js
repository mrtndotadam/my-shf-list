require('dotenv').config();

const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const path = require('path');
const hbs = require('hbs');
const figureController = require('./controllers/figureController');

const app = express();

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log('Connection error:', err));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true
}));

hbs.registerHelper('eq', function (a, b) {
    return a === b;
});

// View engine 
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// Routes
const authRoutes = require('./routes/authRoutes');
const figureRoutes = require('./routes/figureRoutes');
const listRoutes = require('./routes/listRoutes');

app.use((req, res, next) => {
    res.locals.user = req.session.user;
    next();
});

app.use('/', authRoutes);
app.use('/', figureRoutes);
app.use('/', listRoutes);

// Browse Route
app.get('/', figureController.getBrowse);

// Server Startup
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});