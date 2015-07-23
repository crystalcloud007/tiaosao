/**
 * Created by Haoran on 2015/7/18.
 * 有关发帖的API，还没有涉及到文件上传。
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

    // 得到帖子总数
    api.get('/entry_count/:cate_main/:cate_sub', function(req,res)
    {
        console.log(req.params.cate_main + ' || ' + req.params.cate_sub);
        if(req.params.cate_main == 'all')
        {
            Entry.count({completed: true}, function(err,count)
            {
                if(err)
                {
                    res.status(500).send({success: false, message: err});
                    return;
                }
                var page_count = Math.ceil(count / config.entries_per_page);
                res.send({success: true, count: count, page_count: page_count});
            });
        }
        else if(req.params.cate_sub == 'all')
        {
            Entry.count({category_main: req.params.cate_main, completed: true}, function(err,count)
            {
                if(err)
                {
                    res.status(500).send({success: false, message: err});
                    return;
                }
                var page_count = Math.ceil(count / config.entries_per_page);
                res.send({success: true, count: count, page_count: page_count});
            });
        }
        else
        {
            Entry.count({category_main:req.params.cate_main, category_sub: req.params.cate_sub,
                completed: true}, function(err,count)
            {
                if(err)
                {
                    res.status(500).send({success: false, message: err});
                    return;
                }
                var page_count = Math.ceil(count / config.entries_per_page);
                res.send({success: true, count: count, page_count: page_count});
            });
        }
    });

    api.get('/comment_count/:id', function(req,res)
    {
        Comment.count({target: req.params.id}, function(err, count)
        {
            if(err)
            {
                res.status(500).send({success: false, message:err});
                return;
            }
            var page_count = Math.ceil(count / config.comment_per_page);
            res.send({success: true, count: count, page_count: page_count});
        });
    });

    // 得到帖子列表，根据类型和页面显示。
    api.get('/list/:category_main/:category_sub/:page', function(req,res)
    {
        var pageNum = parseInt(req.params.page);
        if(isNaN(pageNum))
        {
            res.status(404).send({success: false, message:'The page your required does NOT exist'});
            return;
        }

        // 提取全部类型
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
        // 提取指定类型
        else
        {
            if(req.params.category_sub == 'all')
            {
                Entry.find({category_main: req.params.category_main})
                    .select('category_main category_sub creator_name title price contact desc count_of_read count_of_comments')
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
                    .select('category_main category_sub creator_name title price contact desc count_of_read count_of_comments')
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
                // 记录观察次数
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
                    res.send({success: false, message: 'No page num specified'});
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

    // 发帖子，写全部内容 -- 图片尚未添加
    api.post('/new/all',function(req,res)
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
                        category_main: req.body.cate_main,
                        category_sub: req.body.cate_sub,
                        creator_name: user.realname,
                        title: req.body.title,
                        price: req.body.price,
                        contact: user.contact,
                        desc: req.body.desc,
                        content:req.body.content,
                        completed: true,
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
                    res.send({success: true, message:'New entry created', id: entry._id});
                });
            }
            else
            {
                res.send({success: false, message: 'Please re-login'});
                return;
            }
        });
    });

    // 发帖子，写主要内容
    api.post('/new/title', function(req,res)
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
                    res.send({success: true, message:'New entry created', id: entry._id});
                });
            }
            else
            {
                res.send({success: false, message: 'Please re-login'});
                return;
            }
        });

    });

    // 发帖子，写描述
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
                res.send({success: true, message:'Description added', id: entry._id});
            });
        });
    });

    // 发帖子，写下自己想写的内容
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
                res.send({success: true, message:'Content added', id: entry._id});
            });
        });
    });

    // 发帖子，上传图片--再说
    api.post('/new/pic/:id', function(req,res)
    {
        Entry.findById(req.params.id).select('pic_lines pic_count completed').exec(function(err, entry)
        {
            if(err)
            {
                res.send({success: false, message: err});
                return;
            }
            // TODO: 根据上传图片更新piclink和计数器，同时完成帖子生成

            entry.completed = true;

            entry.save(function(err)
            {
                if(err)
                {
                    res.send({success: false, message: err});
                    return;
                }
                res.send({success: true, message:'New entry completed', id: entry._id});
            });
        });
    });

    // 编写评论
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

    // 编辑帖子 -- 也是分为编辑title信息，desc信息，content信息，图片信息一共四大块

    // 除了图片外，编辑整个帖子
    api.post('/edit/all/:id', function(req,res)
    {
        Entry.findById(req.params.id).exec(function(err, entry)
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
                    entry.desc = req.body.desc;
                    entry.contact = req.body.contact;
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
                        res.send({success: true, message:'Edit success', id:entry.id});
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
    // 编辑标题和价格
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

    // 编辑描述信息，即desc
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

    // 编辑图片，需要添加图片和删除图片两个API，暂时不写

    // 编辑内容
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

    // 删除帖子 -- 删除帖子，并同时删除相应的图片，以及评论
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

                // TODO: 图片删除

                // 删除评论
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
