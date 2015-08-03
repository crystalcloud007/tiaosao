/**
 * Created by Haoran on 2015/8/3.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PicTrack = new Schema(
    {
        file_name:{type: String, required: true},
        time_creation: {type: Date, default:Date.now},
        status:{type: String, required: true},
    }
);


module.exports = mongoose.model('PicTrack', PicTrack);