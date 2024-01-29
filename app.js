require('dotenv').config();

const express = require('express');
const expressLayout = require('express-ejs-layouts');
const methodOverride = require('method-override');
const cookieParser = require('cookie-parser');
const MongoStore = require('connect-mongo');
const session = require('express-session');

const connectDB = require('./server/config/db');
const { isActiveRoute} = require('./server/helpers/routeHelpers');

const app = express();
const PORT = 5000;

//connect database
connectDB();

app.use(express.urlencoded({ extended: true}));
app.use(express.json());
app.use(cookieParser());
app.use(methodOverride('_method'));

app.use(session({
    secret: 'my secretly secret',
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI
    }),
    //cookie: {maxAge: new Date (Date.now() + (3600000))}
}))

app.use(function (req, res, next){
    res.locals.user = req.user
    next();
});

app.use(express.static('public'));

//middleware
//templating engine
app.use(expressLayout);
app.set('layout', './layouts/main');
app.set('view engine', 'ejs');

app.locals.isActiveRoute = isActiveRoute;

app.use('/', require('./server/routes/main'));

//admin route
app.use('/', require('./server/routes/admin'));

//user route
app.use('/', require('./server/routes/user'));



app.listen(PORT, ()=> {
    console.log(`App listening on port ${PORT}`);
});
