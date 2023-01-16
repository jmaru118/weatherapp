const express        = require('express')
const path           = require('path');
const helmet         = require('helmet');
var bcrypt         = require('bcrypt');
var mongoose       = require('mongoose');
var session        = require('express-session');
var passport       = require('passport');
var localStrategy  = require('passport-local').Strategy;

require('dotenv').config()
require('./models');
const port = 3000;

// mongodb config
var User = mongoose.model('User');
mongoose.set('strictQuery', false);
mongoose.connect('mongodb://127.0.0.1:27017/wdb', 
{useNewUrlParser: true, useUnifiedTopology: true});


var app  = express();
// ===============================================================
//                    Setting up environment
// ===============================================================

// set ejs view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// configure express session
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: false
}));
// passport session to keep user info in session for less db hits
app.use(passport.initialize());
app.use(passport.session());

// helmet to increase security
app.use(helmet({
    frameguard: {         // configure
      action: 'deny'
    },
    contentSecurityPolicy: {    // enable and configure
      directives: {
        defaultSrc: ["'self'", 'jsdelivr.net', 'cloudflare.com', 'fonts.googleapis.com', 'cdnjs.cloudflare.com', 'cdn.jsdelivr.net'],
        styleSrc: ["'self'", 'jsdelivr.net', 'cloudflare.com', 'fonts.googleapis.com', 'cdnjs.cloudflare.com', 'cdn.jsdelivr.net'],
        scriptSrc: ["'self'", 'jsdelivr.net', 'cloudflare.com', 'fonts.googleapis.com', 'cdnjs.cloudflare.com', 'cdn.jsdelivr.net'],
      }
    },
    dnsPrefetchControl: false     // disable
  }))

// passport configuration
passport.use(new localStrategy({
    usernameField: "email",
    passwordField: "password"
}, function(email, password, next) {
    User.findOne({
        email: email
    }, function(err, user) {
        if (err) return next(err);
        if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
            return next({message: 'Email or password incorrect'})
        }
        next(null, user);
    })
}));

passport.use('signup-local', new localStrategy({
    usernameField: "email",
    passwordField: "password"
}, function(email, password, next) {
    User.findOne({
        email: email
    }, function(err, user) {
        if (err) return next(err);
        if (user) return next({message: "User already exists"});
        let newUser = new User({
            email: email,
            passwordHash: bcrypt.hashSync(password, 10)
        })
        newUser.save(function(err) {
            next(err, newUser);
        });
    });
}));

passport.serializeUser(function(user, next) {
    next(null, user._id);
});

passport.deserializeUser(function(id, next) {
    User.findById(id, function(err, user) {
        next(err, user);
    });
});

// ===============================================================
//                      App Routes
// ===============================================================
app.get('/', (req, res) => {
  res.render('index', {title: "Weather App"})
})

app.get('/main', (req, res) => {
  res.render('main', {title: "Main Page"})
})

app.get('/login-page', function(req, res, next) {
  res.render('login-page', {title: "Login Page"})
})

app.post('/login',
    passport.authenticate('local', { failureRedirect: '/login-page' }),
    function(req, res) {
        res.redirect('/main');
    });

app.post('/signup',
    passport.authenticate('signup-local', { failureRedirect: '/' }),
    function(req, res) {
        res.redirect('/main');
    });

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})
