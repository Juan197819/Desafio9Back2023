import { serviceProducts } from "../services/serviceProducts.js"
import { serviceCarts } from "../services/serviceCarts.js";
import __dirname from "../../utils.js";
import {io} from '../../app.js'

 function dtoViews(response) {
    const prod=  response.payload.map(p=>{
        return {
            id:p._id,
            title:p.title,
            description:p.description,
            price:p.price,
            stock:p.stock, 
            category:p.category,
            thumbnail:p.thumbnail
        } 
    }) 
    return prod
}

class ControllerViews{
    async controllerIndex(req, res, next) {
        try {
            res.status(200).redirect('/home')
        } catch (error) {
            next(error)   
        }
     }

    async controllerHome(req, res, next){
        try {
            const {limit, page, sort, code, ...query} = req.query
            const response = await serviceProducts.serviceGetProducts(limit, page, sort, query)
            const products = dtoViews(response)
            req.session.user = req.user
            res.status(200).render('home', { products,...req.user._doc })
        } catch (error) { 
            next(error)   
        }
    }
    async controllerRealtimeproducts(req, res, next){
        let {limit, page, sort, ...query} = req.query
        try {            
            io.on('connection', async socket=>{
                console.log('Usuario conectado')
                const response = await serviceProducts.serviceGetProducts(limit=100, page, sort, query)
                socket.emit('messageServer', dtoViews(response))
                
                socket.on('messageClient', async product=>{
                    await serviceProducts.serviceAddProduct(product)
                    const response = await serviceProducts.serviceGetProducts(limit, page, sort, query)
                    io.emit('messageServer', dtoViews(response))
                })
            })
            res.status(200).render('realtimeproducts.handlebars', { ...req.user._doc })
        } catch (error) {
            console.log(error)
        }
    }
    async controllerProducts(req, res, next){
        const {limit, page, sort, ...query} = req.query
        try {
            const response = await serviceProducts.serviceGetProducts(limit, page, sort, query)
            const products = dtoViews(response)
            res.status(200).render('products', { products, ...response, ...req.user._doc })
        } catch (error) { 
            next(error)
        }
    }
    async controllerViewCart(req, res, next){
        try {
            const { cid } = req.params
            console.log('cid', Boolean(cid))
            let newMap;
            if (cid !='cartEmpty') {
                const products = await serviceCarts.serviceGetProdToCart(cid)
                newMap = products.map(p => {
                    return {
                        ...p.product._doc, quantity: p.quantity
                    }
                })
            }
            res.status(200).render('cart', { newMap, ...req.user._doc })
        } catch (error) { 
            next(error)
        }
    }
    async controllerViewsRegister(req, res, next){
        try {
            res.status(200).render('register')   
        } catch (error) { 
            next(error)
        }
    }  
    async controllerViewsLogin(req, res, next){
        try {
            res.status(200).render('login')   
        } catch (error) { 
            next(error)
        }
    }
    async controllerLogout(req, res, next){
        try {
            req.session.destroy(err=>{
                if(err){
                    throw new Error('Error when deleting the session')
                } console.log('Session delete!!')
                res.status(200).redirect('/login')   
            })
        } catch (error) { 
            next(error)
        }
    }
    async controllerViewsErrorLogin(req, res, next){
        try {
            res.status(400).render('errorLogin')   
        } catch (error) { 
            next(error)
        }
    }
    async controllerViewsErrorRegister(req, res, next){
        try {
            res.status(400).render('errorRegister')   
        } catch (error) { 
            next(error)
        }
    }
}                
export const controllerViews = new ControllerViews()