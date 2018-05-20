const Sequelize = require('sequelize');

const db = new Sequelize('sql2238626', 'sql2238626', 'mS1*uV6*', {
    host : 'sql2.freemysqlhosting.net',
    dialect : 'mysql'
});
//entretien@aditus.info
//YSaCxq5pY^c82rsc

const User = db.define('user', {
    username : { type: Sequelize.STRING },
    password : { type: Sequelize.STRING },
    icon : { type: Sequelize.STRING, defaultValue : "https://d2ln1xbi067hum.cloudfront.net/assets/default_user-abdf6434cda029ecd32423baac4ec238.png"}
});

const Saloon = db.define('saloon', {
    title : { type: Sequelize.STRING },
    author : { type: Sequelize.STRING },
    firstContent : { type : Sequelize.STRING},
    numberOfResponse : { type : Sequelize.INTEGER, defaultValue : 0 }
});

const Response = db.define('response', {
    author : { type: Sequelize.STRING },
    content :  { type: Sequelize.STRING }
});

User.hasMany(Response, {as : 'responses'});

Response.belongsTo(Saloon);
Response.belongsTo(User);

Saloon.hasOne(User);

//db.sync();
//db.drop();


const getUserById = (id, next) => {
    return User
        .findOne({where : {id : id}})
        .then(res => {
            next(res);
        });
};

const getUserByName = (name, next = ()=>{}) => {
    return User
        .findOne({where : {username : name}})
        .then(res => {
            next(res);
        });
};

const getAllSaloons = (next)=>{
    return Saloon
        .findAll()
        .then(res => {
            next(res);
    });
};

const getSaloonById = (id, next) => {
    return Saloon
        .findOne({where : { id : id}})
        .then(res => {
            next(res);
        });
};

const getReponsesByUserId = (id, next) => {
    return Response
        .findAll({where : { userId : id}})
        .then(res => {
            next(res);
        });
};

const getReponsesBySaloonId = (id, next) => {
    return Response
        .findAll({where : { saloonId : id}})
        .then(res => {
            next(res);
        });
};

const createUser = (user) => {
    return User
        .sync()
        .then(()=>{
            User.create(user);
        });
};

const createSaloon = (saloon) => {
    return Saloon
        .sync()
        .then(()=>{
            Saloon.create(saloon);
        });
};

const createResponse = (response) => {
    return Response
        .sync()
        .then(()=>{
            Response.create(response);
        });
};

const updateSaloonById = ((id, update)=>{
    return Saloon
        .findOne({where : {id : id}})
        .then(res=>{
            Saloon.update(update,
                {where : {id : id}})
        });
});

const updateUserById = (id, update)=>{
    return User
        .findOne({whrere : {id : id}})
        .then((res)=>{
            User.update(update, 
            {where : {id : id}})
        });
};

module.exports = {
    getUserById             : getUserById,
    getUserByName           : getUserByName,

    getAllSaloons           : getAllSaloons,
    getSaloonById           : getSaloonById,

    getReponsesByUserId     : getReponsesByUserId,
    getReponsesBySaloonId   : getReponsesBySaloonId,

    createUser              : createUser,

    createSaloon            : createSaloon,

    createResponse          : createResponse,

    updateUserById          : updateUserById,

    updateSaloonById        : updateSaloonById
};