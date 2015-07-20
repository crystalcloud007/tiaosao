/**
 * Created by Haoran on 2015/7/18.
 * 有关用户注册，登录，信息修改等。
 */
var User = require('../models/User');
var jwt = require('jsonwebtoken');
var config = require('../config');
var secretKey = config.secretKey;

// 设置token，强制规定每周过期。
function CreateToken(user)
{
    var token = jwt.sign(
        {
            id: user._id,
            username: user.username,
        },
        secretKey,
        {
            expiresInMinute : 1440
        }
    );

    return token;
}

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
                email: req.body.email || '',						// 用户邮箱
                level: config.level_user['common'],
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
            var token = CreateToken(user);
            res.send(
                {
                    success: true,
                    message: msg,
                    token: token
                }
            );
        });
    });

    api.post('/login', function(req,res)
    {
        User.findOne({username: req.body.username})
            .select('password').exec(function(err, user)
        {
            if(err)
            {
                res.send({success: false, message: err});
                return;
            }
            if(user)
            {
                var valid = user.comparePassword(req.body.password);
                if(valid)
                {
                    var token = CreateToken(user);
                    res.send(
                        {
                            success: true,
                            message: 'Login success',
                            token: token,
                        });
                }
                else
                {
                    res.send({success: false, message: 'Invalid password'});
                    return;
                }
            }
            else
            {
                var msg = 'User: ' + req.body.username + ' does NOT exist';
                res.send({success: false, message: msg});
                return;
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
                    res.status(403).send({success: false, message:'Failed to authenticate user'});
                    return;
                }
                req.decoded = decoded;
                next();
            });
        }
        else
        {
            res.status(403).send({success: false, message:'No token provided'});
        }
    });

    // 查看自己的资料
    api.route('/me')
        .get(function(req,res)
        {
            User.findById(req.decoded.id, function(err, user)
            {
                if (err)
                {
                    res.send({success: false, message: err});
                    return;
                }
                if (user)
                {
                    res.send(
                        {
                            success: true,
                            user: user,
                        }
                    );
                }
                else
                {
                    res.send({success: false, message: 'Failed to find user info'});
                    return;
                }
            });
        })
        .post(function(req,res)
        {
            User.findById(req.decoded.id, function(err, user)
            {
                if(err)
                {
                    res.send({success: false, message: err});
                    return;
                }
                if(user)
                {
                    if(req.body.realname)
                        user.realname = req.body.realname;
                    if(req.body.contact)
                        user.contact = req.body.contact;
                    if(req.body.email)
                        user.email = req.body.email;

                    user.save(function(err)
                    {
                        if(err)
                        {
                            res.send({success: false, message: err});
                            return;
                        }

                        res.send({success: true, message:'User modification success'});
                    });
                }
                else
                {
                    res.send({success: false, message: 'Failed to find user info'});
                    return;
                }
            });

        });

    api.post('/password', function(req,res)
    {
        User.findById(req.decoded.id).select('password').exec(function(err, user)
        {
            if(err)
            {
                res.send({success: false, message: err});
                return;
            }
            if(user)
            {
                user.password = req.body.password;
                user.save(function(err)
                {
                    if(err)
                    {
                        res.send({success: false, message: err});
                        return;
                    }

                    res.send({success: true, message:'Password modification success'});
                });
            }
            else
            {
                res.send({success: false, message: 'Failed to find user info'});
            }
        });
    });
    return api;
}