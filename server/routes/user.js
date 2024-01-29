const express = require('express');
const router = express.Router();

const Item = require('../models/Item');
const Client = require('../models/Client');
const Basket = require('../models/Basket');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');



const userLayout = '../views/layouts/user';
const jwtSecret = process.env.JWT_COOKIE;



//cookie guard -> will log you out if you dont have a cookie :<
//off middleware
// chceck login

const authMiddleware = (req, res, next) => {
    const token = req.cookies.cookie;

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

// GET method in User - dashboard route
router.get('/user', authMiddleware, async (req, res)=>{
    try {
        const locals = {
            title: "Add to basket",
            description: "Simple internet shop made with NodeJS and Express."
        }
        const data = await Item.find();
        res.render('user/index', {
            locals,
            data,
            layout: userLayout
        });
    } catch (error) {
        console.log(error);
    }
});

router.get('/addToBasket/:id', authMiddleware, async(req, res) => {
    try {
        const id = req.params.id;
        const item = await Item.findById(id);


        const token = req.cookies.cookie;
        const decoded = jwt.verify(token, jwtSecret);
        req.userId = decoded.userId;

        user = await Client.findById(req.userId);

        const basket = await Basket.findById(user.basket);

        basket.items = basket.items || [];
        let isItemInBasket = false;
        for( let i of basket.items){
            if(i.item.toString() === item._id.toString()){
                i.quantity +=1;
                isItemInBasket = true;
                break;
            }
        }
        if(!isItemInBasket){
            basket.items.push({
                item: item._id,
                quantity: 1
            })
        }
        await Basket.findByIdAndUpdate(basket._id, basket);
        //console.log("Pushed to basket", basket);
        res.redirect('/user');
    } catch (error) {
        console.log(error);
    }
});

// GET method in User - Basket route
router.get('/basket', authMiddleware, async (req, res)=>{
    try {
        const locals = {
            title: "Basket",
            description: "Simple internet shop made with NodeJS and Express."
        }

        const token = req.cookies.cookie;
        const decoded = jwt.verify(token, jwtSecret);
        req.userId = decoded.userId;
        user = await Client.findById(req.userId);
        const basket = await Basket.findById(user.basket);
        const items = await Item.find();
        const data =[];
        for( let i of basket.items){
            const item = items.find(x => x._id.toString() === i.item.toString());
            data.push({
                id: item._id.toString(),
                name: item.name,
                quantity: i.quantity,
                price: item.price
            });
         }

        res.render('user/basket', {
            locals,
            data,
            layout: userLayout
        });
    } catch (error) {
        console.log(error);
    }
});



router.get('/about-user',(req, res)=>{
    const locals = {
        title: "NodeJS shop",
        description: "Simple internet shop made with NodeJS and Express."
    }
    res.render('user/about-user', {
        locals,
        currentRoute: '/about-user',
        layout: userLayout
    });
});




// GET method in User - order route
router.post('/order', authMiddleware, async (req, res)=>{
    try {
        const token = req.cookies.cookie;
        const decoded = jwt.verify(token, jwtSecret);
        req.userId = decoded.userId;

        user = await Client.findById(req.userId);
        const basket = await Basket.findById(user.basket);
        basket.ordered = true;
        await Basket.findByIdAndUpdate(basket._id, basket);
        res.redirect('/user');
    } catch (error) {
        console.log(error);
    }
});





// GET method in User - logout route
router.get('/logout-user', authMiddleware, async (req, res)=>{
    res.clearCookie('cookie');
    res.redirect('/')
});



module.exports = router;