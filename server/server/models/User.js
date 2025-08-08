const mongoose = require('mongoose');


const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        require:true
    },
    email: {
        type:String,
        require:true, 
        unique: true
    }, 
    password: {
        type:String,
        require:true
    },
    isAdmin: {
        type:Boolean,
        default: false,
        require:true
    },
    phone: {
        type: Number,
        require:true
    },
    address: {
        type: String,
        require:true
    },
    avatar: {
        type: String
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true
    }

},
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

// Virtual field for role
UserSchema.virtual('role').get(function() {
    return this.isAdmin ? 'admin' : 'user';
});

const User = mongoose.model('User',UserSchema);
module.exports = User;