const express = require('express');
const app = express();

const config = require("./config.json");
const backend = require("./backend/mongodb.js");

app.use((req, res, next) => { 
    const auth = req.headers['authorization'];
    if (auth === `Bearer ${config.api_token}`)
        next();
    else
        res.status(401).send("Invalid token");
})

app.get('/cart/:cartId', function(req, res) {
    backend.getCart(req.params.cartId).then(function(cart) {
        if (cart === null) {
            res.status(404).send('Cart not found');
            return;
        }

        let data = [];

        let price = 0;
        let items = 0;

        for (var x in cart.products) {
            items++;
            price += cart.products[x].price;
        }

        data.push(cart);
        data.push({ totalPrice: price, totalItems: items });

        res.status(200).send(data);
    })
    .catch(function(err) {
        console.log(err);
    });
});

app.delete('/cart/:cartId', function(req, res) {
    backend.getCart(req.params.cartId).then(function(cart) {
        if (cart === null) {
            res.status(404).send('Cart not found');
            return;
        }
        backend.deleteCart(cart.token);
        res.status(200).send('Cart has been deleted');
    })
    .catch(function(err) {
        console.log(err);
    });

});

app.put('/cart/:cartId/:productName/:price', function(req, res) {
    if (backend.addProduct(req.params.cartId, req.params.productName, req.params.price, Date.now()))
        res.status(200).send('The item has been added');
    else
        res.status(404).send('Cart not found');
});

app.delete('/cart/:cartId/:productName', function(req, res) {
    if (backend.removeProduct(req.params.cartId, req.params.productName))
        res.status(200).send('The item has been added');
    else
        res.status(404).send('Cart not found');
});


app.listen(process.env.PORT || 3000, () => {
    backend.connect(config.mongodb_url);
});
