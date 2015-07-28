/**
 * Created by Haoran on 2015/7/27.
 */
var Entry = require('../models/Entry');
var User = require('../models/User');
var formidable = require('formidable');
var fs = require('fs');
var config = require('../config');
var file_admin_path = config.file_admin_path;
var file_admin_trash_path = config.file_admin_trash_path;


// 将数据存入数据库
function StoreEntriesToDB(entries, res)
{

}

// 此处没有验证层面，需要在后续中添加。
module.exports = function(app, express)
{
    var api = express.Router();

    api.post('/signup', function(req,res)
    {
        var user = new User(
            {
                username: req.body.username,
                password: req.body.password,
                realname: req.body.realname,
                contact: req.body.contact,							// 手机号码
                email: req.body.email,						        // 用户邮箱
                level: config.level_user['admin']
            }
        );

        user.save(function(err)
        {
            if(err)
            {
                res.send({success: false, message: err});
                return;
            }
            var msg = 'User: ' + user.username + ' is created and stored';
            res.send(
                {
                    success: true,
                    message: msg
                }
            );
        });
    });

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

    // 批量上传帖子的API
    api.post('/entry/batch_post', function(req,res)
    {
        // 上传文件
        var form = new formidable.IncomingForm();
        form.uploadDir = file_admin_path;
        form.parse(req, function(err, fields, files)
        {
            if(err)
            {
                res.send({success: false, message: err});
                return;
            }

            var file_names = [];
            var extension = '.txt';
            var file_count = 0;
            for(var key in files)
            {
                var file = files[key];
                fs.renameSync(file.path, file.path + extension);
                file_names.push(file.path + extension);
                file_count += 1;
            }
            // 文件上传阶段结束
            res.send({success: true, message:'File upload COMPLETED.', count: file_count, file_names: file_names});
                //.redirect('/api/admin/entry/batch_parse');
        });
    });

    api.get('/entry/batch_parse/:filename', function(req,res)
    {
        // 解析文件
        console.log('parsing....');
        var entries = [];
        var entries_to_DB = [];
        var file_name = file_admin_path + req.params.filename + '.txt';
        var count_parse = 0;
        var count_store = 0;
        //console.log(file_name);
        fs.readFile(file_name, 'utf-8', function(err,data)
        {
            if(err)
            {
                res.send({success: false, filename:req.params.filename, message: err});
                return;
            }
            var temp_obj = JSON.parse(data);
            //console.log(temp_obj);
            // 解析文件
            for(var parse_index in temp_obj.entries)
            {
                //console.log(temp_obj.entries[parse_index]);
                count_parse += 1;
                entries.push(temp_obj.entries[parse_index]);
            }
            // 将条目存入数据库
            User.findOne({username:'admin'}).select('_id realname').exec(function(err, user)
            {
                if(err)
                {
                    res.send({success: false, message: err});
                    return;
                }
                for(var entry_index in entries)
                {
                    var entry = new Entry(
                        {
                            creator: user._id,
                            creator_name: user.realname,
                            category_main: entries[entry_index].category_main,
                            category_sub: entries[entry_index].category_sub,
                            title: entries[entry_index].title,
                            price: entries[entry_index].price,
                            region_prov: entries[entry_index].region_prov,
                            region_city: entries[entry_index].region_city,
                            region_disc: entries[entry_index].region_disc,
                            contact_n: entries[entry_index].contact_n,
                            contact_p: entries[entry_index].contact_p,
                            desc: entries[entry_index].desc,
                            content: entries[entry_index].content,
                            completed: true
                        }
                    );
                    entries_to_DB.push(entry);
                    count_store += 1;
                }

                // 批量生成数据库条目
                Entry.create(entries_to_DB, function(err)
                {
                    if(err)
                    {
                        res.send({success: false, message: err});
                        return;
                    }
                    res.send({success:true, message:'File parse and entries store COMPLETED.', count_parse: count_parse, count_store: count_store});
                });
            });
            //res.send({success:true, message:'File parse and entries store COMPLETED. File has been removed.', count_parse: count_parse, count_store: count_store});
        });
    });

    api.get('/entry/batch_clear/:filename', function(req,res)
    {
        var file_name = file_admin_path + req.params.filename + '.txt';
        fs.renameSync(file_name, file_admin_trash_path + req.params.filename + '.txt', function(err)
        {
            if(err)
            {
                res.send({success: false, message: err});
                return;
            }
            var msg = 'File ' + req.params.filename + ' has been moved to the trash folder.';
            res.send({success: true, message:msg});
        });
    });



    return api;
};