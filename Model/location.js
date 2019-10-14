const mongoose=require('mongoose');
const Schema = mongoose.Schema;


const LocationSchema = new Schema({
    
    firstname:{
        type : String
    },
    lastname:{
        type : String
    },
    contact:{
        type : String
    },remarks:{
        type : String
    }
});

const Location = mongoose.model('location',LocationSchema)

module.exports = Location;