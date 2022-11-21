const app = require('./src/app')
const mongoose = require('mongoose');

const DB = process.env.DataBase;

mongoose.connect(DB, {
    UseNewUrlParser: true
}).then( ()=> {
    console.log('DB is Connected successfully....');
})

app.listen(process.env.PORT, () => {
    console.log(`App is running on PORT ${process.env.PORT}....`);
})
