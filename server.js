/**
 * Created by Haoran on 2015/7/18.
 */
var express = require('express');
var bodyparser = require('body-parser');
var favicon = require('serve-favicon');
var morgan = require('morgan');
var mongoose = require('mongoose');
var config = require('./config');

var app = express();

app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(bodyparser.urlencoded({extended: true}));
app.use(bodyparser.json());
app.use(morgan('dev'));

mongoose.connect(config.database, function(err)
{
    if(err) console.log(err);
    else console.log('DB connection established');
});

// Render public files
app.use(express.static(__dirname + '/views'));

// APP apis
var user_api = require('./routes/api_user')(app ,express);
var entry_api = require('./routes/api_entry')(app, express);

app.use('/user', user_api);
app.use('/entry', entry_api);


// Send html file for home page
app.get('/', function(req,res)
{
    res.sendFile(__dirname + '/views/index.html');
});

// FOR any errors
app.use(function(req,res)
{
    res.status(400).send({message: 'Sorry, the resource you requested does NOT exist.'});
});

app.listen(config.port, function(err)
{
    if(err) console.log(err);
    else
    {
        var msg = 'Listening to PORT: ' + config.port;
        console.log(msg);
    }
});