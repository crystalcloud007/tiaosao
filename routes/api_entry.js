/**
 * Created by Haoran on 2015/7/18.
 * �йط�����API����û���漰���ļ��ϴ���
 */
var Entry = require('../models/Entry');
var Comment = require('../models/EntryComment');
var User = require('../models/User');
var jwt = require('jsonwebtoken');
var config = require('../config');
var secretKey = config.secretKey;

module.exports = function(app, express)
{
    var api = express.Router();

    // �õ������б��������ͺ�ҳ����ʾ��
    api.get('/list/:category_main/:category_sub/:page', function(req,res)
    {
        var pageNum = parseInt(req.params.page);
        if(isNaN(pageNum))
        {
            res.status(404).send({success: false, message:'The page your required does NOT exist'});
            return;
        }
        // ��ȡȫ������
        if(req.params.category_main == 'all')
        {
            Entry.find({})
                .select('category_main category_sub creator_name title price contact desc count_of_read count_of_comments')
                .skip((pageNum - 1) * config.entries_per_page)
                .limit(config.entries_per_page).exec(function(err, entries)
            {
                if(err)
                {
                    res.send({success: false, message:err});
                    return;
                }
                res.send({success: true, entries: entries});
            });
        }
        // ��ȡָ������
        else
        {
            if(req.params.category_sub == 'all')
            {
                Entry.find({category_main: req.params.category_main})
                    .select('category_main category_sub creator_name title price desc')
                    .skip((pageNum - 1) * config.entries_per_page).limit(config.entries_per_page)
                    .exec(function(err, entries)
                    {
                        if(err)
                        {
                            res.send({success: false, message:err});
                            return;
                        }
                        res.send({success: true, entries: entries});
                    });
            }
           else
            {
                Entry.find({category_main: req.params.category_main, category_sub: req.params.category_sub})
                    .select('category_main category_sub creator_name title price desc')
                    .skip((pageNum - 1) * config.entries_per_page).limit(config.entries_per_page)
                    .exec(function(err, entries)
                    {
                        if(err)
                        {
                            res.send({success: false, message:err});
                            return;
                        }
                        res.send({success: true, entries: entries});
                    });
            }
        }
    });

    api.get('/detail/:id', function(req,res)
    {
        Entry.findById(req.params.id).exec(function(err, entry)
        {
            if(err)
            {
                res.send({success: false, message:err});
                return;
            }
            if(entry)
            {
                // ��¼�۲����
                entry.count_of_read += 1;
                entry.time_of_last_read = Date.now();
                entry.markModified('time_of_last_read');
                entry.save(function(err)
                {
                    if(err)
                    {
                        res.send({success: false, message: err});
                        return;
                    }
                });
                res.send({success: true, entry: entry});

            }
            else
            {
                res.status(404).send({success: false, message:'No entry found'});
            }
        });



    });

    api.get('/comment/:id/:page', function(req,res)
    {
        Entry.findById(req.params.id).exec(function(err, entry)
        {
            if(err)
            {
                res.send({success: false, message:err});
                return;
            }
            if(entry)
            {
                var pageNum = parseInt(req.params.page);
                if(isNaN(pageNum))
                {
                    res.send({success: false, entry: 'No page num specified'});
                }
                else
                {
                    Comment.find({target: entry._id}).skip((pageNum - 1) * config.comment_per_page)
                        .limit(config.comment_per_page).select('creator_name content time_of_creation')
                        .exec(function(err, comments)
                        {
                            if(err)
                            {
                                res.send({success: false, message: err});
                                return;
                            }
                            else
                            {
                                res.send({success: true, comments: comments});
                            }
                        });
                }

            }
            else
            {
                res.status(404).send({success: false, message:'No entry found'});
            }
        });
    });

    // middleware
    api.use(function(req,res,next)
    {
        var token = req.body.token || req.params.token || req.headers['x-access-token'];
        if(token)
        {
            jwt.verify(token, secretKey, function(err, decoded)
            {
                if(err)
                {
                    res.status(403).send({success: false, message: 'Failed to authenticate token.'});
                }
                req.decoded = decoded;
                next();
            });
        }
        else
        {
            res.status(403).send({message: 'no token provided.'});
        }
    });

    // �����ӣ�д��Ҫ����
    api.post('/new', function(req,res)
    {
        User.findById(req.decoded.id).select('realname contact').exec(function(err, user)
        {
            if(err)
            {
                res.send({success: false, message: err});
                return;
            }
            if(user)
            {
                var entry = new Entry(
                    {
                        creator: req.decoded.id,
                        category_main: req.body.category_main,
                        category_sub: req.body.category_sub,
                        //name_main: config.work_category[req.body.category_main]['name'],
                        //name_sub: config.work_category[req.body.category_main][req.body.category_sub],
                        creator_name: user.realname,
                        title: req.body.title,
                        price: req.body.price,
                        contact: user.contact,
                        desc:{},
                        completed: false,
                    }
                );

                //console.log(entry.creatorName);

                entry.save(function(err)
                {
                    if(err)
                    {
                        res.send({success: false, message: err});
                        return;
                    }
                    res.send({success: true, message:'New entry created'});
                });
            }
            else
            {
                res.send({success: false, message: 'Please re-login'});
                return;
            }
        });

    });

    // �����ӣ�д����
    api.post('/new/desc/:id', function(req,res)
    {
        Entry.findById(req.params.id).select('desc').exec(function(err, entry)
        {
            if(err)
            {
                res.send({success: false, message: err});
                return;
            }
            entry.desc = JSON.parse(req.body.desc);
            entry.save(function(err)
            {
                if(err)
                {
                    res.send({success: false, message: err});
                    return;
                }
                res.send({success: true, message:'Description added'});
            });
        });
    });

    // �����ӣ�д���Լ���д������
    api.post('/new/content/:id', function(req,res)
    {
        Entry.findById(req.params.id).select('content').exec(function(err, entry)
        {
            if(err)
            {
                res.send({success: false, message: err});
                return;
            }
            entry.content = req.body.content;
            entry.save(function(err)
            {
                if(err)
                {
                    res.send({success: false, message: err});
                    return;
                }
                res.send({success: true, message:'Content added'});
            });
        });
    });

    // �����ӣ��ϴ�ͼƬ--��˵
    api.post('/new/pic/:id', function(req,res)
    {
        Entry.findById(req.params.id).select('pic_lines pic_count completed').exec(function(err, entry)
        {
            if(err)
            {
                res.send({success: false, message: err});
                return;
            }
            // TODO: �����ϴ�ͼƬ����piclink�ͼ�������ͬʱ�����������

            entry.completed = true;

            entry.save(function(err)
            {
                if(err)
                {
                    res.send({success: false, message: err});
                    return;
                }
                res.send({success: true, message:'New entry completed'});
            });
        });
    });

    // ��д����
    api.post('/comment/:id', function(req,res)
    {
        Entry.findById(req.params.id).select('count_of_comments completed').exec(function(err,entry)
        {
            if(err)
            {
                res.send({success: false, message: err});
                return;
            }

            if(entry)
            {
                if(!entry.completed)
                {
                    res.send({success: false, message: 'Cannot comment this entry'});
                    return;
                }
                User.findById(req.decoded.id).select('realname').exec(function(err,user)
                {
                    if(err)
                    {
                        res.send({success: false, message: err});
                        return;
                    }


                    var comment = new Comment(
                        {
                            target: req.params.id,
                            creator: req.decoded.id,
                            creator_name: user.realname,
                            content: req.body.content,
                        }
                    );

                    entry.count_of_comments += 1;
                    entry.save(function(err)
                    {
                        if(err)
                        {
                            res.send({success: false, message: err});
                            return;
                        }
                    });

                    comment.save(function(err)
                    {
                        if(err)
                        {
                            res.send({success: false, message: err});
                            return;
                        }
                        res.send({success: true, message:'New comment created'});
                    });
                });
            }
            else
            {
                res.send({success: false, message:'The entry with the id provided does NOT exist'});
            }

        });

    });

    // �༭���� -- Ҳ�Ƿ�Ϊ�༭title��Ϣ��desc��Ϣ��content��Ϣ��ͼƬ��Ϣһ���Ĵ��
    // �༭����ͼ۸�
    api.post('/edit/title/:id', function(req,res)
    {
        Entry.findById(req.params.id).select('creator title price time_of_last_edit').exec(function(err, entry)
        {
            if(err)
            {
                res.send({success: false, message: err});
                return;
            }
            if(entry)
            {
                var verified = entry.verifyCreator(req.decoded.id);
                if(verified)
                {
                    entry.title = req.body.title;
                    entry.price = req.body.price;
                    entry.time_of_last_edit = Date.now();
                    entry.markModified('time_of_last_edit');

                    entry.save(function(err)
                    {
                        if(err)
                        {
                            res.send({success: false, message: err});
                            return;
                        }
                        res.send({success: true, message:'Edit success'});
                    });
                }
                else
                {
                    res.send({success:false, message:'No authority to edit this entry'});
                    return;
                }
            }
            else
            {
                res.status(404).send({success: false, message:'No entry found'});
            }
        });
    });

    // �༭������Ϣ����desc
    api.post('/edit/desc/:id', function(req,res)
    {
        Entry.findById(req.params.id).select('creator desc time_of_last_edit').exec(function(err, entry)
        {
            if(err)
            {
                res.send({success: false, message: err});
                return;
            }
            if(entry)
            {
                var verified = entry.verifyCreator(req.decoded.id);
                if(verified)
                {
                    entry.desc = JSON.parse(req.body.desc);
                    entry.time_of_last_edit = Date.now();
                    entry.markModified('time_of_last_edit');

                    entry.save(function(err)
                    {
                        if(err)
                        {
                            res.send({success: false, message: err});
                            return;
                        }
                        res.send({success: true, message:'Edit success'});
                    });
                }
                else
                {
                    res.send({success:false, message:'No authority to edit this entry'});
                }
            }
            else
            {
                res.status(404).send({success: false, message:'No entry found'});
            }
        });
    });

    // �༭ͼƬ����Ҫ���ͼƬ��ɾ��ͼƬ����API����ʱ��д

    // �༭����
    api.post('/edit/content/:id', function(req,res)
    {
        Entry.findById(req.params.id).select('creator content time_of_last_edit').exec(function(err, entry)
        {
            if(err)
            {
                res.send({success: false, message: err});
                return;
            }

            if(entry)
            {
                var verified = entry.verifyCreator(req.decoded.id);
                if(verified)
                {
                    entry.content = req.body.content;
                    entry.time_of_last_edit = Date.now();
                    entry.markModified('time_of_last_edit');

                    entry.save(function(err)
                    {
                        if(err)
                        {
                            res.send({success: false, message: err});
                            return;
                        }
                        res.send({success: true, message:'Edit success'});
                    });
                }
                else
                {
                    res.send({success:false, message:'No authority to edit this entry'});
                    return;
                }
            }
            else
            {
                res.status(404).send({success:false, message:'No entry found'});
            }

        });
    });

    // ɾ������ -- ɾ�����ӣ���ͬʱɾ����Ӧ��ͼƬ���Լ�����
    api.post('/delete/:id', function(req,res)
    {
        Entry.findById(req.params.id).exec(function(err,entry)
        {
            if(!entry.verifyCreator(req.decoded.id))
            {
                res.send({success: false, message: 'No authority to delete this entry'});
                return;
            }
            if(err)
            {
                res.send({success: false, message: err});
                return;
            }
            if(entry)
            {
                entry.remove(function(err)
                {
                    if(err)
                    {
                        res.send({success: false, message: err});
                        return;
                    }
                });
                //console.log('Entry Deleted');

                // TODO: ͼƬɾ��

                // ɾ������
                Comment.remove({target: req.params.id}, function(err)
                {
                    if(err)
                    {
                        if(err)
                        {
                            res.send({success: false, message: err});
                            return;
                        }
                    }
                });
                //console.log('Comments Deleted');
                res.send({success: true, message:'Entry and all its attachment are deleted'});
            }
            else
            {
                res.send({success: false, message: 'Then entry with the ID provided does NOT exist'});
                return;
            }
        });
    });

    return api;
}
