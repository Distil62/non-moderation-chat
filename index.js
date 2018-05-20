const express           = require("express");
const cookieParser      = require('cookie-parser');
const session           = require('express-session');
const bodyParser        = require('body-parser');
const hash              = require('hash.js');
const axios             = require('axios');

const app = express();

const http              = require('http').Server(app);
const io                = require('socket.io')(http);

const Database          = require('./Database.js');
const Authentification  = require('./Authentifcation.js');
const Socket            = require('./Socket.js');

app.use(express.urlencoded({extended: true}));
app.use(cookieParser(Authentification.cookie));
app.use(session({
    secret: Authentification.cookie,
    resave: false,
    saveUninitialized: false
}));
app.set('view engine', 'pug');
app.use(express.static('public'))
app.use(Authentification.passport.initialize());
app.use(Authentification.passport.session());

const PORT = 8777;

let currentConnected = 0;

app.get("/", (req, res) => {
    Database.getAllSaloons((saloons)=>{
        saloons.reverse();
        res.render("index", {user : req.user, saloons : saloons, currentConnected : currentConnected});
    });
});

app.get("/login", (req, res) => {
    res.render("login", {user : req.user, currentConnected : currentConnected});
});

app.get("/logout", (req, res)=> {
    req.logout();
    res.redirect("/");
})

app.get("/register", (req, res) => {
    res.render("register", {user : req.user, currentConnected : currentConnected});
});

app.get("/saloon/:id", (req, res) => {

    const Complete = (saloon, responses)=>{
        Database.getUserByName(saloon.author, (author)=>{
            res.render("saloon", {user : req.user, author:  author, saloon : saloon, responses : responses, currentConnected : currentConnected})
        })
    }
    
    Database.getSaloonById(req.params.id, (saloon)=>{
        Database.getReponsesBySaloonId(req.params.id, (responses)=>{
            if (responses.length > 0)
            {
                let index = responses.length;
                responses.map((e, i) => {
                    Database.getUserByName(e.author, (user)=>{
                        responses[i].author = user
                        index--;
                        if (index <= 0 )
                            Complete(saloon, responses);
                    })
                });
            }
            else
            {
                Complete(saloon, responses);
            }
        });
    })
});

app.get("/profile", (req, res)=>{
    if (req.user !== undefined)
        res.render("profile", {user : req.user, currentConnected : currentConnected});
    else
        res.redirect('/');

});

app.post("/api/post/login", Authentification.passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login'
}));

app.post("/api/post/create/user", (req, res) => {
    req.body.password = hash.sha256().update(req.body.password).digest('hex');
    Database.createUser(req.body).then(()=>{
        req.login(req.body, (err)=>{
            if (err)
                console.error(err);
            res.redirect("/");
        });
    });
    
});

app.post("/api/post/create/saloon", (req, res) => {
    if (req.user)
        req.body["author"] = req.user.username;
    else
        req.body["author"] = "Inconnu";
    Database.createSaloon(req.body);
    io.emit("newSaloon", req.body);
    
});

app.post("/api/post/create/response/:id", (req, res) => {
    if (req.user)
    {
        req.body["author"] = req.user.username;
    }
    else
    {
        req.body["author"] = "Inconnu"
    }
    req.body["saloonId"] = req.params.id;
    Database.createResponse(req.body);
    Database.getSaloonById(req.params.id, (saloon)=>{
        Database.updateSaloonById(req.params.id, { numberOfResponse : saloon.numberOfResponse + 1});
        res.redirect("/saloon/" + req.params.id);
        io.emit("newResp", req.body);
    });


});

app.post("/api/post/updateIconUser", (req, res)=>{
    axios.get(req.body.icon)
    .then((response)=>{
        req.user.icon = req.body.icon;
        Database.updateUserById(req.user.id, {icon : req.body.icon});
        res.render("profile", {currentConnected : currentConnected, user : req.user});
    })
    .catch((err)=>{
        res.render("profile", {message : true, currentConnected : currentConnected, user : req.user})
    })
});

io.on("connection", (socket)=>{
    socket.broadcast.emit("connection", ++currentConnected);
    socket.on('disconnect', ()=>{
        socket.broadcast.emit("connection", --currentConnected);        
      });
    
});

http.listen(PORT, console.log("The server is listen on port http://127.0.0.1:" + PORT));