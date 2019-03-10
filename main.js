const json_parse = require("json-parse-safe");
const stringify = require("json-stringify");
const fs = require("fs");
const https = require("https");
const express = require("express");
var app = express();

var privateKey = fs.readFileSync(
  "Your privateKey",
  "utf8"
);
var certificate = fs.readFileSync(
  "Your fullChain",
  "utf8"
);

app.use(express.static(__dirname + "/client/"));

const credentials = { key: privateKey, cert: certificate };

var httpsServer = https.createServer(credentials, app);
httpsServer.listen(443);

var WebSocketServer = require("ws").Server;
var wss = new WebSocketServer({
  server: httpsServer
});

const func_send = require("./func/send_messages");
const options = require("./func/options");

const version = "1.0.3";

var list_ws = [];
var list_username = {};
var clients_ip = [];
var isAlive = [];
try {
  var commandes = fs.readFileSync("./res/commandes.json");
  commandes = json_parse(commandes);
} catch (e) {
  console.log(e);
}

function checkIFAliveWS() {
  for (var i = 0; i < list_ws.length; i++) {
    if (list_ws[i] === undefined) {
      let prov_list_ws = [];
      for (var i = 0; i < list_ws.length; i++) {
        if (list_ws[i] !== undefined) {
          prov_list_ws.push(list_ws[i]);
        }
      }
      list_ws = prov_list_ws;
      return;
    }
    try {
      isAlive[i] = false;
      list_ws[i].send("ping");
    } catch (e) {
      console.log(e);
      delete list_ws[i];
    }
  }
}
setInterval(checkIFAliveWS, 10000);
wss.on("connection", function connection(ws, req) {
  list_ws.push(ws);
  isAlive.push(true);
  clients_ip.push(req.connection.remoteAddress);

  let obj_tosend = {
    user: "System",
    msg: "Welcome"
  };
  obj_tosend = stringify(obj_tosend);
  func_send.send_message(ws, obj_tosend);

  function heartbeat(i) {
    isAlive[i] = true;
    //console.log("Its true for "+list_username[i]);
  }

  ws.on("message", function incoming(message) {
    try {
      var prefix = "/";

      for (var i = 0; i < list_ws.length; i++) {
        if (list_ws[i] === ws) {
          let obj = json_parse(message);
          if (obj.value.version.includes(version) === false) {
            return;
          }
          if (
            obj.value.ping === "pong" &&
            obj.value.version.includes(version)
          ) {
            heartbeat(i);
            return;
          }
          if (obj.value.msg === undefined) {
            return;
          }

          if (obj.value.msg.includes(prefix + "user")) {
            console.log("[*] Tendative de connexion");
            let recv = options.usercontrol(obj.value.msg, ws);
            if (recv !== 0) {
              list_ws[i] = recv.socket;
              list_username[i] = recv.user;
              //console.log(recv.user);
              return;
            } else {
              return;
            }
          } else if (list_username[i] === undefined || list_username[i] === 0) {
            options.usernoAllowed(ws);
          }

          // commandes
          else if (
            obj.value.msg.includes(prefix + "setPassword") &&
            list_username[i] !== undefined &&
            list_username[i] !== 0
          ) {
            options.setPassword(obj.value.msg, ws, list_username[i]);
          } else if (
            obj.value.msg.includes(prefix + "setPicture") &&
            list_username[i] !== undefined &&
            list_username[i] !== 0
          ) {
            options.setpicture(obj.value.msg, ws, list_username[i]);
          } else if (
            obj.value.msg.includes(prefix + "createUser") &&
            list_username[i] !== undefined &&
            list_username[i] !== 0
          ) {
            options.createUser(obj.value.msg, ws, list_username[i]);
          } else if (
            obj.value.msg.includes(prefix + "deleteUser") &&
            list_username[i] !== undefined &&
            list_username[i] !== 0
          ) {
            options.deleteUser(obj.value.msg, ws, list_username[i]);
          } else if (
            obj.value.msg.includes(prefix + "cmd") &&
            list_username[i] !== undefined &&
            list_username[i] !== 0
          ) {
            options.commandes(
              obj.value.msg,
              ws,
              list_username[i],
              commandes.value,
              prefix
            );
          } else if (
            obj.value.msg.includes(prefix + "who_online") &&
            list_username[i] !== undefined &&
            list_username[i] !== 0
          ) {
            options.who_online(
              ws,
              list_username[i],
              list_username,
              list_ws,
              isAlive
            );
          } else if (
            obj.value.msg.includes(prefix + "who") &&
            list_username[i] !== undefined &&
            list_username[i] !== 0
          ) {
            options.who(obj.value.msg, ws, list_username[i], isAlive);
          } else if (
            obj.value.msg.includes(prefix + "video") &&
            list_username[i] !== undefined &&
            list_username[i] !== 0
          ) {
            options.video(
              obj.value.msg,
              ws,
              list_username[i],
              list_ws,
              list_username
            );
          } else if (
            obj.value.msg.includes(prefix + "youtube") &&
            list_username[i] !== undefined &&
            list_username[i] !== 0
          ) {
            options.youtube(
              obj.value.msg,
              ws,
              list_username[i],
              list_ws,
              list_username
            );
          } else if (
            obj.value.msg.includes(prefix + "forceRefresh") &&
            list_username[i] !== undefined &&
            list_username[i] !== 0
          ) {
            options.forceRefresh(ws, list_username[i], list_ws);
          } else if (list_username[i] !== undefined && list_username[i] !== 0) {
            for (var k = 0; k < commandes.value.length; k++) {
              if (obj.value.msg.includes(prefix + commandes.value[k].name)) {
                continue;
              } else {
                options.sendMessages(
                  ws,
                  list_username[i],
                  obj.value.msg,
                  list_ws,
                  clients_ip,
                  list_username
                );
                break;
              }
            }
          }
        }
      }
    } catch (e) {
      console.log(e);
    }
  });
  ws.on("error", function(err) {
    console.log(err.code);
    for (var i = 0; i < list_ws.length; i++) {
      if (list_ws[i] === ws) {
        list_ws[i] = undefined;
        clients_ip[i] = undefined;
        list_username = undefined;
      }
    }
  });
  ws.on("close", function(ws, req) {
    for (var i = 0; i < list_ws.length; i++) {
      let obj_tosend = {
        user: "System",
        msg: "Goodbye, " + list_username[i]
      };
      obj_tosend = stringify(obj_tosend);
      func_send.send_message(ws, obj_tosend);
      if (list_ws[i] === ws) {
        list_ws[i] = undefined;
        clients_ip[i] = undefined;
        list_username = undefined;
        console.log(ws + " est parti");
      }
    }
  });
});
