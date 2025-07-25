const {default:mongoose} = require('mongoose');

async function DbConnect() {
    try {
        const Conn = await mongoose.connect(process.env.MONGO_URL);
        console.log("Database ket noi thanh cong");
    } catch (error) {
        console.log(error.message);
        process.exit(1);
    }
}
module.exports = DbConnect;