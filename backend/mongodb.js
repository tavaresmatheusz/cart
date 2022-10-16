const mongoose = require('mongoose');
let connected;

const cartSchema = new mongoose.Schema({
    token: String,
    products: [{
        name: String,
        price: {type: Number, min: 0},
        addedIn: Date
    }],
},
{
    query:{
        byToken(cartToken){
        return this.where({ token: cartToken })
        }
    }
});

const Cart = mongoose.model('Cart', cartSchema);

async function connect(uri) {
    mongoose.connect(uri).then(() => {
        console.log("Conexão efetuada com sucesso.");
        connected = true;
    }).catch(() => {
        console.log("Conexão não efetuada.");
        connected = false;
    });
    return connected;
}

async function getCart(cartToken) {
    if (!connected)
        return null;
    return await Cart.findOne({token:cartToken});
}

async function deleteCart(cartToken) {
    if (!connected)
        return null;
    return await Cart.deleteOne({token:cartToken});
}

async function addProduct(cartToken, productName, productPrice, productAddedIn) {
    if (!connected)
        return false;

    let cart = getCart(cartToken);
    if (cart === null) {
        cart =  new Cart({
            token: cartToken,
            products: []
        });
        console.log("Carrinho criado.");
    }
    
    cart.products.push({ name: productName, price: productPrice, addedIn: productAddedIn });
    cart.save().then(() => console.log("Item adicionado no carrinho com sucesso."));
    return true;
}

async function removeProduct(cartToken, productName) {
    if (!connected)
        return false;

    let cart = getCart(cartToken);
    if (cart === null)
        return false;
    
    cart.products.pull(cart.products.find(element => element.name === productName));
    cart.save().then(() => console.log("Item removido do carrinho com sucesso."));
    return true;
}


module.exports = { connect, addProduct, removeProduct, deleteCart, getCart };