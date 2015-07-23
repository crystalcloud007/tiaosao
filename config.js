/**
 * Created by Haoran on 2015/7/18.
 */
module.exports=
{
    // ������Ŀ
    database: 'mongodb://root:root123456@ds036648.mongolab.com:36648/tiaosao',
    secretKey: 'TiaoSaoWebSecretKey',
    port: process.env.PORT || 3000,

    // ��������
    entries_per_page: 10,                      // ÿҳ���ض���������
    comment_per_page: 5,                       // ÿҳ��ʾ����������

    // �ļ�
    file_upload_path: './public/tmp/',
    file_store_path: './public/upload/',
    file_trash_path: './public/trash/',
    file_admin_path: './adimn/',
    pic_upload_size: 2 * 1024 * 1024,

    // �йصȼ�
    level_user: {'common': 0, 'vip':1},
    level_entry: {'common': 0, 'vip': 1, 'long': 2},
    pic_count_max:{'common': 4, 'vip': 10},
    entry_lifespan: {'common': 7, 'vip': 15, long:'30'},

    // ҵ������
    work_category:
    {
        'real-estate':{'name':'����','rent':'�ⷿ','sale':'����','buy':'��'},
        'house-work':{'name':'����','clean':'���'},
        'mating':{'name':'����','date':'Լ��'},
    },

    // ����--�����з��������Ӱ�
    status_user: {'normal': 'normal', 'frozen': 'frozen'},
    status_entry: {'normal': 'normal', 'deleted': 'deleted'},
}