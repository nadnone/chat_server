const Client = require("pg-native");

var client = new Client();
try {
    client.connectSync("postgresql://tchat:7842925043@localhost:5432/chat");
} catch (e) {
    console.log(e);
}

module.exports = {

  query: function(query){
      try {
          return client.querySync(query);

      } catch (e) {
          console.log(e);
      }
 }


};
