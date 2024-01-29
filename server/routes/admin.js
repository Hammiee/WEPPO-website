const express = require('express');
const router = express.Router();
const Item = require('../models/Item');
const User = require('../models/User');
const Basket = require('../models/Basket');
const Client = require('../models/Client');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


const adminLayout = '../views/layouts/admin';
const jwtSecret = process.env.JWT_SECRET;



//cookie guard -> will log you out if you dont have a cookie :<
//off middleware
// chceck login

const authMiddleware = (req, res, next) => {
    const token = req.cookies.token;

    if(!token){
        //render a page or message instead TODO
        return res.status(401).json({ message: 'Unathorized'});
    }

    try{
        const decoded = jwt.verify(token, jwtSecret);
        req.userId = decoded.userId;
        next();
    } catch(error) {
        res.status(401).json({ message: 'Unathorized'});
    }
}




// GET method in Admin - Login route
router.get('/admin', async (req, res)=>{
    const locals = {
        title: "Admin",
        description: "Simple internet shop made with NodeJS and Express."
    }
    try {
        const data = await Item.find();
        res.render('admin/index', { locals, layout: adminLayout });
    } catch (error) {
        console.log(error);
    }
});


// POST method in Admin - check login route
router.post('/admin', async (req, res)=>{
    try {

        const {username, password} = req.body;

        const user = await User.findOne({ username });

        if(!user){
            return res.status(401).json( { message: 'Invalid user' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if(!isPasswordValid){
            return res.status(401).json( { message: 'Invalid password' });
        }

        const token = jwt.sign({ userId: user._id}, jwtSecret);
        res.cookie('token', token, {httpOnly: true});

        res.redirect('/dashboard');

    } catch (error) {
        console.log(error);
    }
});

// GET method in Admin - dashboard route
router.get('/dashboard', authMiddleware, async (req, res)=>{
    try {
        const locals = {
            title: "Dashboard",
            description: "Simple internet shop made with NodeJS and Express."
        }
        const data = await Item.find();
        res.render('admin/dashboard', {
            locals,
            data,
            layout: adminLayout
        });
    } catch (error) {
        console.log(error);
    }
});

// GET method in Admin - create new item route
router.get('/add-item', authMiddleware, async (req, res)=>{
    try {
        const locals = {
            title: "Add Item",
            description: "Simple internet shop made with NodeJS and Express."
        }
        const data = await Item.find();
        res.render('admin/add-item', {
            locals,
            layout: adminLayout
        });
    } catch (error) {
        console.log(error);
    }
});


// POST method in Admin - create new item route
router.post('/add-item', authMiddleware, async (req, res)=>{
    try {
        try {
            const newItem = new Item({
                name: req.body.name,
                body: req.body.body,
                price: req.body.price
            }); 

            await Item.create(newItem);
            res.redirect('/dashboard');
        } catch (error) {
            console.log(error);
        }
    } catch (error) {
        console.log(error);
    }
});


// GET method in Admin - edit item route
router.get('/edit-item/:id', authMiddleware, async (req, res)=>{
    try {

        const locals = {
            title: "Edit Item",
            description: "Simple internet shop made with NodeJS and Express."
        }

        const data = await Item.findOne({ _id: req.params.id });

        res.render('admin/edit-item', {
            locals,
            data,
            layout: adminLayout
        });
    } catch (error) {
        console.log(error);
    }
});


// PUT method in Admin - edit item route
router.put('/edit-item/:id', authMiddleware, async (req, res)=>{
    try {

        await Item.findByIdAndUpdate(req.params.id, {
            name: req.body.name,
            body: req.body.body,
            price: req.body.price
        });

        res.redirect(`/edit-item/${req.params.id}`);
        

    } catch (error) {
        console.log(error);
    }
});


// DELETE method in Admin - delete item route
router.delete('/delete-item/:id', authMiddleware, async (req, res)=>{
    try {

        await Item.deleteOne({ _id: req.params.id});
        res.redirect('/dashboard');
    } catch (error) {
        console.log(error);
    }
});


// GET method in Admin - logout route
router.get('/logout', authMiddleware, async (req, res)=>{
    res.clearCookie('token');
    res.redirect('/')
});



// POST method in Admin - register route
router.post('/register', async (req, res)=>{
    try {
        const {username, password} = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        try {
            const user = await User.create({ username, password: hashedPassword});
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


// GET method in Admin - orders route
router.get('/active-orders', authMiddleware, async (req, res)=>{
    try {
        const locals = {
            title: "Orders",
            description: "Simple internet shop made with NodeJS and Express."
        }
        const baskets = await Basket.find();

        const clients = await Client.find();
        const products = await Item.find();

        const data =[];

        for(let cart of baskets){
            const user = clients.find(user => user.basket.toString() === cart._id.toString());
            const name = user.username;
            const ifOrdered = cart.ordered;
            contents = [];
            for(let item of cart.items){
                const product = products.find( product => product._id.toString() === item.item.toString());
                contents.push({
                    name: product.name,
                    quantity: item.quantity,
                    price: product.price
                });
            }
            data.push({
                contents: contents,
                name: name,
                ifOrdered: ifOrdered
            });
        }
        res.render('admin/active-orders', {
            locals,
            data,
            layout: adminLayout
        });
    } catch (error) {
        console.log(error);
    }
});


// GET method in Admin - users route
router.get('/active-users', authMiddleware, async (req, res)=>{
    try {
        const locals = {
            title: "Users",
            description: "Simple internet shop made with NodeJS and Express."
        }
        const clients = await Client.find();
        res.render('admin/active-users', {
            locals,
            clients,
            layout: adminLayout
        });
    } catch (error) {
        console.log(error);
    }
});



module.exports = router;