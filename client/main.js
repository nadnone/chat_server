var wss = new WebSocket("wss://chat.nadirfelder.xyz:443/");

window.username = "";
window.conn = "";

function chatElement(){
  let writebox = document.getElementsByClassName('writebox')[0];
  let chatbox = document.getElementsByClassName('chatbox')[0];
  let contenu = chatbox.getElementsByClassName('contenu')[0];
  let end = contenu.getElementsByClassName('end')[0];
  return {
    "contenu": contenu,
    "chatbox": chatbox,
    "writebox": writebox,
    "end": end
  };
}
function server_down(){
    if (window.conn === undefined || window.conn === "") {
        let element = chatElement();
        let message = document.createElement("div");
        message.className = "system";
        message.innerText = "Your Computer : The server is down";
        element.contenu.appendChild(message);
    }

}
function scrollDown(){
  let element = chatElement();
  let yEnd = element.end.offsetTop;
  element.contenu.scrollTo(0, yEnd);

}

addEventListener("keypress", function(event){
      let element = chatElement();
      let msg = document.getElementById('msg').value;
    if (event.keyCode === 13) {
        if (msg.includes("/user")) {
            let m = msg.split(" ");
            username = m[1];
            console.log(username);
        }
      let obj = {
        "msg": msg
      };
      server_down();
      try{
          sendMessage(JSON.stringify(obj), conn);
      }
      catch(e){
          console.log(e);
      }
      document.getElementById('msg').value = "";
    }
});
function sendMessage(msg, conn){
 	conn.send(msg);
}
wss.onopen = function(event){
  window.conn = this;
  this.onmessage = function(event){

    let element = chatElement();
    let obj = JSON.parse(event.data.toString());

    let gif = "";
    let user = obj.user;
    let msg = obj.msg;
    let picture = obj.picture;
    if(obj.gif !== undefined){
      gif = obj.gif;
    }
    if (obj.refresh === "true") {
        window.setTimeout(function(){
            window.location.reload(true);
        }, 3000);
    }

    let image = "";
    let markdown = "";
    if (msg.includes("https://") || msg.includes("http://")) {

    let regex = new RegExp("(http\:\/\/|https\:\/\/.+.png|jpeg|jpg)");
    image = regex.exec(msg);

    if (image === undefined ||image === null) {
      image = "";
    }
    image = image[0];
    if (image === undefined ||image === null) {
      image = "";
    }
    else{
    image = "<img src='"+image+"'/>";

    }
    let link = [];

      let m = msg.split(" ");
      for (var i = 0; i < m.length; i++) {
        if (m[i].includes("http://") || m[i].includes("https://")) {
          link.push(m[i]);
        }
      }
      for (var i = 0; i < link.length; i++) {
          markdown += "<a targer='_blank' href='"+link[i]+"'>"+link[i]+"</a>";
          msg = msg.replace(link[i], "");
      }
    }

    let message = document.createElement("div");
    let icon = document.createElement("div");

    function wizz_sound(){
        try {
            let wizz = document.getElementById("wizz_audio");
            wizz.play();
            console.log("Wizz");
        } catch (e) {
            console.log(e);
        }
    }

    if (msg.includes("@"+window.username)) {
        icon.className = "wizz_img";
        icon.style.backgroundImage = "url('"+picture+"')";
        message.className = "wizz";
        message.innerText = user+" : "+msg;
        message.innerHTML += markdown;
        message.innerHTML += image;
        message.innerHTML += gif;
        wizz_sound();
    }
    else if (user === "System") {
        icon.className = "system_img";
        message.className = "system";
        message.innerText = user+" : "+msg;


    }
    else if (user === username) {
        icon.className = "moi_img";
        message.className = "moi";
        icon.style.backgroundImage = "url('"+picture+"')";
        message.innerText = msg;
        message.innerHTML += markdown;
        message.innerHTML += image;
        message.innerHTML += gif;



    }
    else {
        icon.className = "peer_img";
        message.className = "peer";
        icon.style.backgroundImage = "url('"+picture+"')";
        message.innerText = user+" : "+msg;
        message.innerHTML += markdown;
        message.innerHTML += image;
        message.innerHTML += gif;


    }
    icon.innerText = "x";
    message.appendChild(icon);
    element.contenu.insertBefore(message, element.end);
    conn = this;
    scrollDown();


  }

  this.onerror = function(err){
	console.log(err);
    }
}
