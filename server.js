// Modules
var http = require("http");
const express = require('express')



const app = express()
var ejs = require('ejs')
let bodyParser = require('body-parser');
var fs = require('fs')
var path = require('path');


var bcrypt = require('bcrypt-nodejs');


var mysql = require('mysql')
var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'expressjs'
});


// Config
// set the view engine to ejs
app.set('view engine', 'ejs');
// Static files
app.use('/static', express.static(path.join(__dirname, 'public')))
// add bodyParser Middelwear
app.use(bodyParser.urlencoded({ extended: false }))

var passport = require('passport')
var LocalStrategy = require('passport-local').Strategy;
app.use(require('cookie-parser')());
app.use(require('express-session')({ secret: 'keyboard cat', resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

passport.use(
  'local-signup',
  new LocalStrategy({
    // by default, local strategy uses username and password, we will override with email
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true // allows us to pass back the entire request to the callback
  },
    function (req, username, password, done) {
      // find a user whose email is the same as the forms email
      // we are checking to see if the user trying to login already exists
      connection.query("SELECT * FROM users WHERE username = ?", [username], function (err, rows) {
        if (err)
          return done(err);
        if (rows.length) {
          return done(null, false, req.flash('signupMessage', 'That username is already taken.'));
        } else {
          // if there is no user with that username
          // create the user
          var newUserMysql = {
            username: username,
            password: bcrypt.hashSync(password, null, null)  // use the generateHash function in our user model
          };

          var insertQuery = "INSERT INTO users ( username, password ) values (?,?)";

          connection.query(insertQuery, [newUserMysql.username, newUserMysql.password], function (err, rows) {

            newUserMysql.id = rows.insertId;
            return done(null, newUserMysql);
          });
        }
      });
    })
);

// =========================================================================
// LOCAL LOGIN =============================================================
// =========================================================================
// we are using named strategies since we have one for login and one for signup
// by default, if there was no name, it would just be called 'local'

passport.use(
  'local-login',
  new LocalStrategy({
    // by default, local strategy uses username and password, we will override with email
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true // allows us to pass back the entire request to the callback
  },
    function (req, username, password, done) { // callback with email and password from our form
      connection.query("SELECT * FROM users WHERE username = ?", [username], function (err, rows) {
        if (err)
          return done(err);
        if (!rows.length) {
          return done(null, false, req.flash('loginMessage', 'No user found.')); // req.flash is the way to set flashdata using connect-flash
        }

        // if the user is found but the password is wrong
        if (!bcrypt.compareSync(password, rows[0].password))
          return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.')); // create the loginMessage and save it to session as flashdata

        // all is well, return successful user
        return done(null, rows[0]);
      });
    })
);

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

// used to deserialize the user
passport.deserializeUser(function (id, done) {
  connection.query("SELECT * FROM users WHERE id = ? ", [id], function (err, rows) {
    done(err, rows[0]);
  });
});

// Models
var Message = require('./models/message');
var User = require('./models/user');

// Routing
app.get('/', (req, res) => {
  res.render('index.ejs');
})

app.get('/login', function (req, res) {
  // render the page and pass in any flash data if it exists
  res.render('login.ejs', {  });
});

// process the login form
app.post('/login', passport.authenticate('local-login', {
  successRedirect: '/profile', // redirect to the secure profile section
  failureRedirect: '/login', // redirect back to the signup page if there is an error
  failureFlash: true // allow flash messages
}),
  function (req, res) {
    console.log("hello");

    if (req.body.remember) {
      req.session.cookie.maxAge = 1000 * 60 * 3;
    } else {
      req.session.cookie.expires = false;
    }
    res.redirect('/');
  });



// =====================================
	// SIGNUP ==============================
	// =====================================
	// show the signup form
	app.get('/signup', function(req, res) {
		// render the page and pass in any flash data if it exists
		res.render('signup.ejs', {  });
	});
  
	// process the signup form
	app.post('/signup', passport.authenticate('local-signup', {
		successRedirect : '/profile', // redirect to the secure profile section
		failureRedirect : '/signup', // redirect back to the signup page if there is an error
		failureFlash : true // allow flash messages
  }));
  
  app.get('/profile', isLoggedIn, function(req, res) {
		res.render('profile.ejs', {
			user : req.user // get the user out of session and pass to template
		});
	});


app.post('/', (req, res) => {

  let m = new Message();
  m.create((err, data) => {
    if (err) {
      console.log(err)
    } else { }
  }, req.body.message)

  res.render('index.ejs');
})

app.get('/list', (req, res) => {
  let m = new Message();
  m.list(function (err, data) {
    if (!err) {
      let rows = data
      console.log('rows : ', rows)
      res.render('liste.ejs', { rows: rows });
    }
  })
})


function isLoggedIn(req, res, next) {
  
    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
      return next();
  
    // if they aren't redirect them to the home page
    res.redirect('/');
  }
app.listen(3000, () => console.log('Example app listening on port 3000!'))





