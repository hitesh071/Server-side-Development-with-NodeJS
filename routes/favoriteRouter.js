const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Favorites = require('../models/favorites');
const authenticate = require('../authenticate');
const Dishes = require('../models/dishes');
const cors = require('./cors'); 
const ObjectId=require('mongodb').ObjectId;
const favoriteRouter = express.Router();

favoriteRouter.use(bodyParser.json());


favoriteRouter.route('/')
.options(cors.corsWithOptions,(req,res)=>{res.sendStatus(200);})
.get(cors.cors,authenticate.verifyUser,(req,res,next)=>{
    Favorites.findOne({user:req.user._id})
    .populate('dishes')
    .populate('user')
    .then((favorite)=>{
        if(favorite){
            res.statusCode=200;
            res.setHeader('content-Type','application/json');
            res.json(favorite);
        }
        else{
            var err = new Error('NO Favorites found.');
            err.status=404;
            return next(err);
        }
    },(err)=>next(arr))
    .catch((err)=>next(err));
})
.post(authenticate.verifyUser, (req, res, next) => {
    let data = new ObjectId(req.body._id);
    Favorites.findOne({ user: req.user._id })
      .then(
        (favorite) => {
          if (!favorite) {
            Favorites.create({
              user: req.user._id,
              dishes: data,
            }).then((favorite) => {
              res.json(favorite);
            });
          } else {
            Favorites.findOne({ user: req.user._id })
              .then(
                (favorite) => {
                  if (!favorite.dishes.includes(req.params.dishId)) {
                    favorite.dishes.push(data);
                    favorite.save().then((favorite) => {
                      res.status = 200;
                      res.setHeader("Content-Type", "application/json");
                      res.json(favorite);
                    });
                  } else {
                    res.status = 403;
                    res.setHeader("Content-Type", "application/text");
                    res.send("Dish is already present in list");
                  }
                },
                (err) => next(err)
              )
              .catch((err) => next(err));
          }
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })

.put(cors.corsWithOptions,authenticate.verifyUser,(req,res,next)=>{
    res.statusCode=403;
    res.end('PUT opertaion is not supported on /favourites');
})
.delete(cors.corsWithOptions,authenticate.verifyUser,(req,res,next)=>{
    Favorites.deleteOne({user:req.user._id})
    .then((favorite)=>{
        res.status=200;
        res.setHeader("Content-Type","application/json");
        res.json(favorite);     
    },(err)=>next(err))
    .catch((err)=>next(err));
});

favoriteRouter.route('/:dishId')
.options(cors.corsWithOptions,(req,res)=>{res.sendStatus(200);})
.get(cors.corsWithOptions,authenticate.verifyUser,(req,res,next)=>{
    res.statusCode=403;
    res.end('GET opertaion is not supported on /favourites/:dishId');
})
.post(cors.corsWithOptions,authenticate.verifyUser,
    (req,res,next)=>{
    Dishes.findOne({_id:req.params.dishId})
    .then((favorite)=>{
        Favorites.findOne({user:req.user._id})
        .then((favorite)=>{
            if(!favorite){
                Favorites.create({
                    user:req.user._id,
                    dishes :req.params.dishId
                })
                .then((favorite)=>{
                    res.status=200;
                    res.setHeader('Content-type','application/json');
                    res.json(favorite);
                });
            }else{
                if(!favorite.dishes.includes(req.params.dishId)){
                    Favorites.findOne({user:req.params._id})
                    .then((favorite)=>{
                        favorite.dishes.push(req.params.dishId);
                        favorite.save()
                        .then((favorite)=>{
                            res.status=200;
                            res.setHeader('Content-type','application/json');
                            res.json(favorite);
                        },(err)=>next(err))
                        .catch((err)=>next(err));
                    });
                }else{
                    res.status=403;
                    res.setHeader('Content-type','application/json');
                    res.json('Dish is already present in list');
                }
            }
        });
    })
    .catch((err)=>next(err));
    
})
.put(cors.corsWithOptions,authenticate.verifyUser,(req,res,next)=>{
    res.statusCode=403;
    res.end('PUT opertaion is not supported on /favourites/:dishId');
})   
.delete(cors.corsWithOptions,authenticate.verifyUser,(req,res,next)=>{
    Favorites.findOne({user:req.user._id})
    .then((favorite)=>{
        if(favorite){
            Favorites.findOne({dishes:req.params.dishId})
            .then((favorite)=>{
                if(favorite){
                    favorite.dishes.pull(req.params.dishId);
                    favorite.save()
                    .then((favorite)=>{
                        res.status=200;
                        res.setHeader('Content-type','application/json');
                        res.json(favorite);
                    },(err)=>next(err))
                    .catch((err)=>next(err));
                }else{
                    res.status=404;
                    res.setHeader('Content-type','application/json');
                    res.json('Dish Does not exists');                   
                }
            },(err)=>next(err))
            .catch((err)=>next(err));
        }else{
            res.status=404;
            res.setHeader('Content-type','application/json');
            res.json('Favorite for this user Does not exists'); 
        }
    },(err)=>next(err))
    .catch((err)=>next(err));
});
module.exports = favoriteRouter;