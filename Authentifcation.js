const cookieParser      = require('cookie-parser');
const session           = require('express-session');
const passport          = require('passport');
const LocalStrategy     = require('passport-local').Strategy;
const Database      = require('./Database.js');
const hash = require('hash.js')


const COOKIE_SECRET = 'OuYouNaMarre';

passport.use(new LocalStrategy((username, password, cb) => {
    password = hash.sha256().update(password).digest('hex');

    return Database.getUserByName(username, (res)=>{
        if (res === null)
        {
            return cb(new Error("Identifiants incorrectes !"));            
        }
        else if (password !== res.password)
        {
            return cb(new Error("Identifiants incorrectes !"));
        }
        return cb(null , res);
    })
}));

passport.serializeUser((user, cb) => {
    console.log("SERIALIEZ");
    console.log(user);
    cb(null, user.username);
});


passport.deserializeUser((username, cb) => {
    console.log("DESERIALIZE");
    console.log(username);
    return Database.getUserByName(username, (res)=>{         
            if (username !== res.username)
                return cb(new Error("No user corresponding to the cookie's email address"));

        return cb(null, res);
    })
});

module.exports = {
    cookie : COOKIE_SECRET,
    passport : passport
}