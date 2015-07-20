/**
 * Created by Haoran on 2015/7/18.
 * ��¼�û�ÿ�ջ������actionһ��ľ������ݴ���
 */
var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var UserLog = new Schema(
    {
        target: {type:Schema.Types.ObjectId, ref:'User'},
        action: [Schema.Types.Mixed],
    }
);

UserLog.methods.addNewActionEntry = function(aEntry)
{
    this.action.push(aEntry);
}

module.exports=mongoose.model('UserLog', UserLog);