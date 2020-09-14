const func_send = require("./send_messages");
const stringify = require("json-stringify");
const bcrypt = require("bcrypt");
const database = require("./database");

const saltRounds = 12;

module.exports = {

  usercontrol:  function(msg, ws){
      try {
          let m = msg.split(" ");
          let client_user = m[1];
          let client_pass = m[2];
          if (m[0] !== undefined && m[1] !== undefined && m[2] !== undefined) {
              let res = database.query("SELECT password, username FROM chat_comptes WHERE username = '"+client_user+"'");
              if (res[0] !== undefined) {
                  if (client_user === res[0].username && bcrypt.compareSync(client_pass, res[0].password)) {
                      let obj_tosend = {
                          user: "System",
                          msg: "Welcome "+client_user
                      };
                      func_send.send_message(ws, stringify(obj_tosend));
                      return {
                          socket: ws,
                          user: client_user
                      };
                  }
                  else {
                      let obj_tosend = {
                          user: "System",
                          msg: "Bad account"
                      };
                      console.log(client_user + " : " + bcrypt.compareSync(client_pass, res[0].password));
                      func_send.send_message(ws, stringify(obj_tosend));
                      return 0;
                  }

              }
              else {
                  let obj_tosend = {
                      user: "System",
                      msg: "Bad account"
                  };
                  func_send.send_message(ws, stringify(obj_tosend));
                  return 0;
              }
          }

      } catch (e) {
          console.log(e);
          return 0;
      }

        },
    usernoAllowed: function (ws){
      let objToSend = {
        "user": "System",
        "msg": "Connection: /user [user] [password]"
      };
      objToSend = stringify(objToSend);
      func_send.send_message(ws, objToSend);
    },
    sendMessages: function(ws, username, msg, list_ws, clients_ip, list_username){

      let data = database.query("SELECT picture FROM chat_comptes WHERE username = '"+username+"';");

      let objToSend = {
        "user": username,
        "msg": msg,
        "picture": data[0].picture
      };
      objToSend = stringify(objToSend);
      for (var i = 0; i < list_ws.length; i++){
          if (list_username[i] !== undefined && list_username[i] !== 0) {
              func_send.send_message(list_ws[i], objToSend);
          }
        }
    },
    setPassword: function(msg, ws, username){
        let obj_tosend;
        try {
            let m = msg.split(" ");
            if (m[0] !== undefined && m[1] !== undefined){
                let newPass = m[1];
                let hashedPass = bcrypt.hashSync(newPass);
                database.query("UPDATE chat_comptes SET password = '"+hashedPass+"' WHERE username = '"+username+"';");
                obj_tosend = {
                    user: "System",
                    msg: "Password saved."
                };

            }
        }catch (e) {
                console.log(e);
                obj_tosend = {
                    user: "System",
                    msg: "Error, please retry."
                };

            }
            finally{
                func_send.send_message(ws, stringify(obj_tosend));
            }
        },
    createUser: function(msg, ws, username){
        let obj_tosend;
      try {
          let m = msg.split(" ");
          let password = bcrypt.hashSync(m[2]);
          if (database.query("SELECT \"isAdmin\" FROM chat_comptes WHERE username = '"+username+"'")[0].isAdmin) {
              database.query("INSERT INTO chat_comptes (username, password) VALUES('"+m[1]+"', '"+password+"');");
              obj_tosend = {
                  user: "ADMINSys",
                  msg: "User "+m[1]+" Created"
              };
          }

      } catch (e) {
           obj_tosend = {
            user: "ADMINSys",
            msg: "Error, please retry"
          };
        console.log(e);
      }
      finally{
          obj_tosend = stringify(obj_tosend);
          func_send.send_message(ws, obj_tosend);

      }
    },
    deleteUser: function(msg, ws, username){
          let obj_tosend;
            try {

                if (database.query("SELECT \"isAdmin\" FROM chat_comptes WHERE username = '"+username+"'")[0].isAdmin) {

                    database.query("DELETE FROM chat_comptes WHERE username = '"+msg.split(" ")[1]+"'");

                    obj_tosend = {
                        "user": "ADMINSys",
                        "msg": "User deleted"
                    };

                }

            } catch (e) {
              console.log(e);
              obj_tosend = {
                  "user": "ADMINSys",
                  "msg": "Error, please retry"
              };


          }finally{
              obj_tosend = stringify(obj_tosend);
              func_send.send_message(ws, obj_tosend);
          }
    },
    setpicture: function(msg, ws, username){
        let obj_tosend;
        try {
            let m = msg.split(" ");
            let picture = m[1];

            database.query("UPDATE chat_comptes SET picture = '"+picture+"' WHERE username = '"+username+"'");
            obj_tosend = {
                "user": "System",
                "msg": "picture saved"
            };

        } catch (e) {
            console.log(e);
            obj_tosend = {
                "user": "System",
                "msg": "Error, please retry"
            };

        } finally {
            obj_tosend = stringify(obj_tosend);
            func_send.send_message(ws, obj_tosend);

        }
    },
    commandes: function(msg, ws, username, commandes, prefix){
      let sendMsg = "List of commands :";
      for (var i = 0; i < commandes.length; i++) {
        sendMsg += "\n\n"+commandes[i].description;
        sendMsg += "\n"+commandes[i].how;
      }

      let obj_tosend = {
          user: "System",
          msg: sendMsg
      };
      obj_tosend = stringify(obj_tosend);
      func_send.send_message(ws, obj_tosend);
    },
    who: function(msg, ws, username){
        let obj_tosend = {};
      try {
          let comptes = database.query("SELECT username FROM chat_comptes");
          obj_tosend.user = "System";
          obj_tosend.msg = "\n";
          for (var i = 0; i < comptes.length; i++) {
              obj_tosend.msg += comptes[i].username+"\n";
          }


      } catch (e) {
          console.log(e);
          obj_tosend.user = "Sytem";
          obj_tosend.msg = "Error, please retry";
      } finally {

          obj_tosend = stringify(obj_tosend);
          func_send.send_message(ws, obj_tosend);
      }
    },
    video: function(msg, ws, username, list_ws, list_username){
        let obj_tosend;
        try {
            let m = msg.split(" ");

            let gif = "<video autoplay controls><source src='"+m[1]+"' type='video/mp4'></video>";
            msg = "";
            let picture = database.query("SELECT picture FROM chat_comptes WHERE username = '"+username+"';")[0].picture;
            obj_tosend = {
                user: username,
                msg: msg,
                gif: gif,
                picture: picture
            };

        } catch (e) {
            console.log(e);
        } finally {
            obj_tosend = stringify(obj_tosend);
            for (var i = 0; i < list_ws.length; i++) {
                if (list_username[i] !== undefined && list_username[i] !== 0){
                    func_send.send_message(list_ws[i], obj_tosend);
                }
            }
        }
    },
    youtube: function(msg, ws, username, list_ws, list_username){
        let obj_tosend;
      try{

        let m = msg.split(" ");
        if (m[1].includes("https://www.youtube.com/watch?v=")) {
          m = m[1].replace("https://www.youtube.com/watch?v=", "");
        }
        else {
          return;
        }
        let video = "<iframe src='https://www.youtube.com/embed/"+m+"' allow='autoplay; encrypted-media'></iframe>";
        let picture = database.query("SELECT picture FROM chat_comptes WHERE username = '"+username+"';")[0].picture;
        obj_tosend = {
          user: username,
          msg: "",
          gif: video,
          picture: picture
        };
      }
      catch(e){
        console.log(e);
      }finally{
          obj_tosend = stringify(obj_tosend);
          for (var i = 0; i < list_ws.length; i++) {
            if (list_username[i] !== undefined && list_username[i] !== 0){
                func_send.send_message(list_ws[i], obj_tosend);
            }
          }
      }
  },
  forceRefresh: function(ws, username, list_ws){
      let obj_tosend = {};
      try {
          if (database.query("SELECT \"isAdmin\" FROM chat_comptes WHERE username = '"+username+"'")[0].isAdmin) {
              obj_tosend.user = "Admin "+username;
              obj_tosend.msg = "Refresh in 3s";
              obj_tosend.refresh = "true";
          }

      } catch (e) {
          console.log(e);
          obj_tosend.user = "ADMINSys";
          obj_tosend.msg = "Failed to reload";
      } finally {
          obj_tosend = stringify(obj_tosend);
          for (var i = 0; i < list_ws.length; i++) {
              func_send.send_message(list_ws[i], obj_tosend);
          }
      }
  },
  who_online: function(ws, username, list_username, list_ws, isAlive){
      let table = [];
      for (var i = 0; i < list_ws.length; i++) {
          if (isAlive[i] === true) {
              table.push(list_username[i]);
          }
      }
      let obj_tosend = {
          user: "online_system",
          msg: table
      };
      obj_tosend = stringify(obj_tosend);
      func_send.send_message(ws, obj_tosend);
  }
};
