/**
 * Created by Haoran on 2015/7/18.
 */
var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var Schema = mongoose.Schema;

var UserSchema = new Schema(
    {
        username: {type:String, required:true, index:{unique: true}},
        password: {type:String, required:true, select: false},
        realname: {type:String, required:true},
        photourl: {type:String, default:''},
        contact:{type: String, default:''},
        email:{type: String, default:''},
        level:Number,
        verified: {type: Boolean, default: false},
        frozen: {type: Boolean, default: false},
        //posts_count_today: {type:Number, default:0},      // 发帖次数，移动到USER LOG中
        time_of_reg:{type:Date, default: Date.now()}
    }
);

// Hash密码
UserSchema.pre('save', function(next)
{
    var user = this;
    if(!this.isModified('password')) return next();

    bcrypt.hash(user.password, null, null, function(err, hash)
    {
        if(err) return next(err);

        user.password = hash;
        next();
    });
});

// 比较密码
UserSchema.methods.comparePassword = function(password)
{
    var user = this;
    return bcrypt.compareSync(password, user.password);
}

module.exports = mongoose.model('User', UserSchema);