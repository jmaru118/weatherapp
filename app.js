const express        = require('express')
const path           = require('path');
const helmet         = require('helmet');
const bcrypt         = require('bcrypt');
const mongoose       = require('mongoose');
require('./models');
const port = 3000;

const user = mongoose.model('User');
mongoose.set('strictQuery', false);
mongoose.connect('mongodb://localhost:27017/wdb', 
                {useNewUrlParser: true, useUnifiedTopology: true});
const app            = express();

// set ejs view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// app.use(helmet({
//     frameguard: {         // configure
//       action: 'deny'
//     },
//     contentSecurityPolicy: {    // enable and configure
//       directives: {
//         defaultSrc: ["'self'"],
//         styleSrc: ["'self'"],
//         scriptSrc: ["'self'"],
//       }
//     },
//     dnsPrefetchControl: false     // disable
//   }))

app.get('/', (req, res) => {
  res.render('index', {title: "Weather App"})
})

app.post('/signup', function(req, res, next) {
  let newUser = new user({
    email: req.body.email,
    passwordHash: bcrypt.hash(req.body.password, 12, (err, hash) => {
      /*Store hash in your db*/
    })
  })
  newUser.save();
})
app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})
