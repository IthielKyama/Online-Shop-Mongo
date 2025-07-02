const path = require('path');
require('dotenv').config();

const uri = process.env.MONGODB_URI;
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');
const multer = require('multer');

const errorController = require('./controllers/error');
const User = require('./models/user');

const app = express();
const store = new MongoDBStore({
  uri: uri,
  collection: 'sessions',
});

const csrfProtection = csrf();

// ✔️ Session middleware
app.use(
  session({
    secret: 'my secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
    store: store,
  })
);

// ✔️ Multer file handling
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images');
  },
  filename: (req, file, cb) => {
    cb(
      null,
      new Date().toISOString().replace(/:/g, '-') + '-' + file.originalname
    );
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg'
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

// ✔️ View engine
app.set('view engine', 'ejs');
app.set('views', 'views');

// ✔️ Routes
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

// ✔️ Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single('image')
);
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use(csrfProtection);
app.use(flash());

// ✔️ Locals middleware with error handling for csrf
app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session ? req.session.isLoggedIn : false;
  try {
    res.locals.csrfToken = req.csrfToken();
  } catch (err) {
    res.locals.csrfToken = '';
  }
  next();
});

// ✔️ Attach user to request if logged in
app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then((user) => {
      if (!user) {
        return next();
      }
      req.user = user;
      next();
    })
    .catch((err) => {
      next(new Error(err));
    });
});

// ✔️ Routes
app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

// ✔️ Error routes
app.get('/500', errorController.get500);
app.use(errorController.get404);

// ✔️ Error-handling middleware
app.use((error, req, res, next) => {
  res.status(500).render('500', {
    pageTitle: 'Error!',
    path: '/500',
    isAuthenticated: req.session ? req.session.isLoggedIn : false,
  });
});

// ✔️ MongoDB connection
mongoose
  .connect(uri)
  .then((result) => {
    app.listen(3000, () => {
      console.log('Server is running on http://localhost:3000');
    });
  })
  .catch((err) => {
    console.log(err);
  });
