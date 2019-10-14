const mongoose=require('mongoose');
const Schema = mongoose.Schema;


const SubscriptionSchema = new Schema({
  
    endpoint: String,
    expirationTime: String,
    keys:{
        p256dh: String,
        auth: String   
    }
});

const Subscription = mongoose.model('subscription',SubscriptionSchema)

module.exports = Subscription;