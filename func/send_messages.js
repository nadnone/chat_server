const WebSocket = require("ws");

module.exports = {

  send_message: function(ws, msg){
    try{
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(msg);
      }
    }
    catch (error) {
      console.log(error);

    }
  }


};
