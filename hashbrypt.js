const bcrypt = require("bcrypt");


const hash = bcrypt.hashSync('1234', 12);

console.log(hash);