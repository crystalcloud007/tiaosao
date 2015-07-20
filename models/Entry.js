/**
 * Created by Haoran on 2015/7/18.
 * ���ӵĶ��塣�û��Լ��������𣬱�������������ݡ��Լ��ϴ�ͼƬ��������URL��
 * һЩ��¼��Ϣ������������޸ģ�����Ķ���ʱ�䡣
 * desc���û�������վģ����д�����ݣ�һЩ�ؼ��Ե�����������ַ��ĵ�ַ����񣬳���ȣ�����������ݽṹ�
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Entry = new Schema(
    {
        creator: {type: Schema.Types.ObjectId, ref:'User'},             // ������ID����
        category_main: {type: String, required: true},                  // ҵ������𣬲��ҵ�����
        category_sub:{type: String, required: true},                    // ҵ������ĳҵ���·�������
        //name_main:{type:String, required: true},                        // ���������
        //name_sub:{type:String, required: true},                         // ���������
        creator_name: String,
        title: String,
        price: Number,
        contact: String,
        desc:Schema.Types.Mixed,
        pic_links: {type: [String], default:[]},
        pic_count: {type: Number, default: 0},
        content: {type: String ,default: ''},
        completed: {type: Boolean, default: false},             // ��û��������ӣ����۸���ԭ�򣩣�������Ϊfalse������һ��ʱ����ɾ����
        time_of_creation: {type: Date, default:Date.now},
        time_of_last_edit: {type: Date, default: Date.now},
        time_of_last_read: {type: Date, default: Date.now},
        count_of_comments: {type: Number, default:0},
        count_of_read: {type: Number, default: 0},
    }
);

Entry.methods.verifyCreator = function(creatorID)
{
    return this.creator == creatorID;
}

module.exports = mongoose.model('Entry', Entry);

