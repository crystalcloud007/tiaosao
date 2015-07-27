/**
 * Created by Haoran on 2015/7/27.
 */
var Entry = require('../models/Entry');
var User = require('../models/User');
var config = require('../config');

// �˴�û����֤���棬��Ҫ�ں�������ӡ�
module.exports = function(app, express)
{
    var api = express.Router();

    api.get('/user/:username', function(req,res)
    {
        User.findOne({username:req.params.username}, function(err, user)
        {
            if(err)
            {
                res.send({success: false, message: err});
                return;
            }
            res.send({success: true, user: user});
        });
    });

    // �����ϴ����ӵ�API

    return api;
};