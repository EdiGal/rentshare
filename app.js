const express = require("express");
const app = express();

const postsLogic = require('./logic/posts.js')
const usersRepository = require('./data/users');
const geoLogic = require('./data/geo');

app.use(require('serve-favicon')(__dirname + '/public/favicon.ico'));
app.set('view engine', 'ejs');
app.use(express.static('public'))

app.use(require("express-session")({
    secret:"thisisthemostsafetysecretever",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

app.use(require("cookie-parser")("thisisthemostsafetysecretever"));

const passport = require("passport");
app.use(passport.initialize());
app.use(passport.session());

const localStrategy = require("passport-local");
passport.use(new localStrategy(async function(username, password, done) {
    let user = await usersRepository.GetUserByUserNameAndPassword(username, password)//users.find(user=>user.username.toLowerCase()==username.toLowerCase());
    if(user) {
        return done(null, user);
    }
    else {
        return done(null, false);
    }
}))

passport.serializeUser(async function(_user, done) {
    let user = await usersRepository.GetUserById(_user._id);
    if(user) {
        done(null, user._id);
    }
    else {
        done(new Error("Cant serialize this user"));
    }
})

passport.deserializeUser(async function(userId, done) {
    let user = await usersRepository.GetUserById(userId);
    if(user) {
        done(null, user);
    }
    else {
        done(new Error("Cant deserialize this user"));
    }
})

let bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use((req, res, next)=>{
    console.log((req.isAuthenticated()?'authenticated':'not authenticated')+':'+req.method+' : '+req.url);
    next();
})


app.post("/login", passport.authenticate('local', {
    successRedirect: "/",
    failureRedirect:"/"
}))

app.get("/", async function(req, res) {
    let posts = await postsLogic.GetPosts();
    let cities = await geoLogic.GetAllIsraelyCities();
    let user = (req.user||{});
    res.render('rentsharelist',{posts, cities, user});
})

app.get('/share', async function(req, res) {
    if(req.isAuthenticated()) {
        let cities = await geoLogic.GetAllIsraelyCities();
        res.render('forms/newshareform',{user:req.user, cities:cities, user:(req.user||{})})
    }
    else {
        res.render('forms/loginform')
    }
})

app.post('/post', (req, res) => {
    if(req.isAuthenticated()&&req.user&&req.body&&req.body.city&&req.body.area&&req.body.rooms>0&&req.body.rooms<16&&req.body.meter>9&&req.body.meter<851&&req.body.cost>99&&req.body.cost<25001){
        let post ={
            city:req.body.city,
            area:req.body.area,
            rooms:parseInt(req.body.rooms),
            meter:parseInt(req.body.meter),
            cost:parseInt(req.body.cost),
            postDate : new Date(),
            userId : req.user._id
        };
        postsLogic.AddNewPost(post).then(()=>res.redirect('/'));
    }
    else {
        res.status(404).send();
    }
})

app.post('/search', async function(req, res){
    let city = req.body.city;
    let fromRooms = req.body.fromRooms;
    let toRooms = req.body.toRooms;
    try{
        let posts = await postsLogic.Search(city, fromRooms, toRooms);
        res.send(posts)
    }
    catch(e){
        console.error(e)
    }
})

app.delete('/post/:id', (req, res) => {
    let id = req.params.id;
    if(req.isAuthenticated()&&req.user&&req.user.type=="Admin"){
        postsLogic.DeletePost(id).then(result=>{
            if(result.result.n==1) {
                res.send('ok')
            }
            else {
                res.status(404).send();
            }
        });
    }
    else {
        res.status(404).send();
    }
})

app.get('/register', (req, res) => {
    res.render('forms/registerform');
})

const RegisterNewUser = require('./logic/register').RegisterNewUser
app.post('/register', (req, res) => {
    let username = req.body.username;
    let password = req.body.password;
    if(username && password) {
        RegisterNewUser(username, password)
        .then(()=>{res.status(200).send()})
        .catch(()=>{res.status(404).send()})
    }
    else {
        res.status(404).send()
    }
})

const GetIsraelyCityByName = require('./data/geo').GetIsraelyCityByName;
app.get('/city/:city', async function(req, res){
    let cityName = req.params.city;
    let city = await GetIsraelyCityByName(cityName);
    if(city) {
        res.send(city);
    }
    else {
        res.status(404).send();
    }
})

app.listen(process.env.PORT || 3000)