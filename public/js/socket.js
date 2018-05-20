let socket = io();

const reloadAll = ()=>{
    io.broadcast.emit("newResp", {page : parseInt(location.href.split("/")[4]), content : "Bonjour"});
}

const newSaloon = ()=>{
    io.broadcast.emit("newSaloon");
}


socket.on("newResp", (data)=>{
    if (data.saloonId == location.href.split("/")[4])
    {
        let s = '<div class="card"><div class="row valign-wrapper" style="padding : 8px; margin : 0px;"><div class="col"><img class="circle responsive-img" width="48px" height="48px" src="https://d2ln1xbi067hum.cloudfront.net/assets/default_user-abdf6434cda029ecd32423baac4ec238.png"/></div><div class="col"><span style="font-size : 24px;"> '+ data.author +' </span></div></div><hr /><div style="padding : 18px; text-align:justify;"><span> '+ data.content +' </span></div></div>'
        let htmlObject = document.createElement('div');
        htmlObject.innerHTML = s;
        document.querySelector("#respList").appendChild(htmlObject);
    }
});

socket.on("newSaloon", (data)=>{
    console.log(data);
    let a = document.querySelectorAll("a");
    let newId = parseInt(a[3].href.split("/")[4]) + 1;
    newId = newId.toString();
    let s = '<a href="/saloon/'+ newId +'"><div class="row"><div class="col"><p class="black-text"> ' + data.title + '</p></div><div class="col right"><span>Réponses : 0</span></div></div></a>'
    let htmlObject = document.createElement('li');
    htmlObject.classList = "collection-item";
    htmlObject.innerHTML = s;
    document.querySelector("#saloonList").prepend(htmlObject);
    
})

socket.on("connection", (data)=>{
    document.querySelector("#currentConnected").textContent = data;
})