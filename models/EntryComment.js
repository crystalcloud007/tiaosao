/**
 * Created by Haoran on 2015/7/18.
 * 对于本贴子的讨论
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var EntryComment = new Schema(
    {
        target: {type: Schema.Types.ObjectId, required: true, ref:'Entry'},
        creator: {type: Schema.Types.ObjectId, required: true, ref: 'User'},
        creator_name: {type: String, required: true},
        content: String,
        time_of_creation:{type: Date, default: Date.now()},
    }
);

module.exports = mongoose.model('Comment', EntryComment);