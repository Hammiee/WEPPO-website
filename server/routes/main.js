const express = require('express');
const router = express.Router();

const Item = require('../models/Item');
const Client = require('../models/Client');
const Basket = require('../models/Basket');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const jwtSecret = process.env.JWT_COOKIE;

//routes
//TODO -- maybe controllers are better??

// GET method in HOME route
router.get('', async (req, res)=>{
    const locals = {
        title: "NodeJS shop",
        description: "Simple internet shop made with NodeJS and Express."
    }
    try {
        const data = await Item.find();
        res.render('index', {
            locals,
            data,
            currentRoute: '/'
        });
    } catch (error) {
        console.log(error);
    }
});


//GET method in Item :id route

router.get('/item/:id', async (req, res)=>{
    try {
            
        const locals = {
            title: "NodeJS shop",
            description: "Simple internet shop made with NodeJS and Express."
        }

        let slug = req.params.id;

        const data = await Item.findById({ _id: slug});
        res.render('item', {
            locals,
            data,
            currentRoute: `/item/${slug}`
        });
    } catch (error) {
        console.log(error);
    }
});

//POST method in Item - serachTerm route

router.post('/search', async (req, res)=>{
    try {
        const locals = {
            title: "Search",
            description: "Simple internet shop made with NodeJS and Express."
        }

        let searchTerm = req.body.searchTerm;
        const searchNoSpecialChar = searchTerm.replace(/[^a-zA-Z0-9 ]/g, "")

        const data = await Item.find({
            $or: [
                {name: { $regex: new RegExp(searchNoSpecialChar, 'i')}},
                {body: { $regex: new RegExp(searchNoSpecialChar, 'i')}}
            ]
        });

        res.render("search", {
            data,
            locals,
            currentRoute: '/search'
        });
    } catch (error) {
        console.log(error);
    }
});


/*
function insertItemData (){
    Item.insertMany([
        {
            name: "Example item",
            body: "Your standard example item"
        },
        {
            name: "Chair",
            body: "The best chair you ever sat at"
        },
        {
            name: "Glass",
            body: "Super fancy glass"
        },
        {
            name: "Chocolate",
            body: "The yummiest chocolate you ever ate"
        },
        {
            name: "Pen",
            body: "Just something to write with"
        },
    ])
}
insertItemData();*/


router.get('/about',(req, res)=>{
    const locals = {
        title: "NodeJS shop",
        description: "Simple internet shop made with NodeJS and Express."
    }
    res.render('about', {
        locals,
        currentRoute: '/about'
    });
});

router.get('/log-user',(req, res)=>{
    const locals = {
        title: "NodeJS shop",
        description: "Simple internet shop made with NodeJS and Express."
    }
    res.render('log-user', {
        locals,
        currentRoute: '/log-user'
    });
});

// POST method in home - register route
router.post('/signup', async (req, res)=>{
    try {
        const {username, password} = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        try {
            const newBasket = new Basket({
                items: [],
                ordered: false
            });
            await newBasket.save();
            const user = await Client.create({ username, password: hashedPassword, basket: newBasket._id});
            res.status(201).json({message: 'User Created', user});
            
        } catch (error) {
            if(error.code === 11000){
                res.status(409).json({message: 'User already in use'});
            }
            res.status(500).json({ message: 'Internal server error'})
        }

    } catch (error) {
        console.log(error);
    }
});


// POST method in Home - check login route
router.post('/login', async (req, res)=>{
    try {

        const {username, password} = req.body;

        const user = await Client.findOne({ username });

        if(!user){
            return res.status(401).json( { message: 'Invalid user' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if(!isPasswordValid){
            return res.status(401).json( { message: 'Invalid password' });
        }

        const token = jwt.sign({ userId: user._id}, jwtSecret);
        res.cookie('cookie', token, {httpOnly: true});

        res.redirect('/user');

    } catch (error) {
        console.log(error);
    }
});



module.exports = router;