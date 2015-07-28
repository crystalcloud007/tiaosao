/**
 * Created by Haoran on 2015/7/18.
 */
module.exports=
{
    // 基本项目
    database: 'mongodb://root:root123456@ds036648.mongolab.com:36648/tiaosao',
    secretKey: 'TiaoSaoWebSecretKey',
    port: process.env.PORT || 3000,

    // 返回数据
    entries_per_page: 10,                      // 每页返回多少条帖子
    comment_per_page: 5,                       // 每页显示杜少条回帖

    // 文件
    file_upload_path: './public/tmp/',
    file_store_path: './public/upload/',
    file_trash_path: './public/trash/',
    file_admin_path: './admin/',
    file_admin_trash_path: './admin/trash/',
    pic_upload_size: 2 * 1024 * 1024,

    // 有关等级
    level_user: {'common': 0, 'vip':1, 'admin': 1000},
    level_entry: {'common': 0, 'vip': 1, 'long': 2},
    pic_count_max:{'common': 4, 'vip': 10},
    entry_lifespan: {'common': 7, 'vip': 15, long:'30'},

    // 地点索引和数据库地点项目转换
    // 目前只有北上广深天五个城市
    location_index:
    {
        'bj': {eng: 'Beijing',chn: '北京'},
        'tj': {eng: 'Tianjin',chn: '天津'},
        'sh': {eng: 'Shanghai', chn: '上海'},
        'gz': {eng: 'Guangzhou', chn: '广州'},
        'sz': {eng: 'Shenzhen', chn: '深圳'},
    },

    // 业务类型 -- 在前端即可，后端没有必要做这个事情。
    work_category:
    {
        'real-estate':{'name':'房产','rent':'租房','sale':'卖房','buy':'买房'},
        'house-work':{'name':'家政','clean':'清洁'},
        'mating':{'name':'交友','date':'约会'},
    },

    // 属性--随着研发进度增加吧
    status_user: {'normal': 'normal', 'frozen': 'frozen'},
    status_entry: {'normal': 'normal', 'deleted': 'deleted'},
}