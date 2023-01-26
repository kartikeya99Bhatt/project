//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const dotenv=require("dotenv");


const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const app = express();
dotenv.config();
app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended: true
}));



app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());

//MONGODB CONNECTION
mongoose.set("strictQuery", false);
mongoose
    .connect(process.env.MONGO_URL)
    .then(()=>console.log("DB connection successful."))
    .catch((err)=>{console.log(err);
});

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});
userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


//HOME ROUTE
app.get("/", function (req, res) {
    res.render("home");
});

//REGISTER ROUTE
app.get("/register", function (req, res) {
    res.render("register");
});
 
//LOGIN ROUTE
app.get("/login", function (req, res) {
    res.render("login");
});

app.post("/register", function (req, res) {
   
    User.register({username:req.body.username},req.body.password,function(err,user){
        if(err){
            console.log(err);
            res.redirect("/register");
        }else{
            passport.authenticate("local")(req,res,function(){
                res.redirect("/success");
            })
        }
    })
});

app.post("/login", function (req, res) { 
    const user=new User({
        username:req.body.username,
        password:req.body.password
    });
    req.login(user,function(err){
        if(err){
            console.log(err);
        }else{
            passport.authenticate("local")(req,res,function(){
                res.redirect("/success");
            })
        }
    })
});

app.get("/logout",function(req,res){
    req.logout(function(err){
        if(err){
            console.log(err);
        }else{
            res.redirect("/");
        }
    });
    
});

app.get("/success",function(req,res){
    if(req.isAuthenticated()){
        res.render("success");
    }else{
        res.redirect("/login");
    }
});
app.listen(3000, function () {
    console.log("Server started on port 3000.");
})