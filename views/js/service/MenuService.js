/**
 * Created by Haoran on 2015/7/22.
 */
angular.module('MenuService', [])
    .factory('MenuItem', function()
    {
        var menuFac = {};

        menuFac.items =
            [
                //all :
                /*{
                    dis_name:'全部',
                    value:'all',
                    subs: [{dis_name:'全部', value:'all'}]
                },*/
                //real_estate:
                {
                    dis_name: '房产',
                    value:'real_estate',
                    subs:
                        [
                            //{dis_name:'全部', value:'all'},
                            {dis_name:'出租', value:'rent'},
                            {dis_name:'出售', value:'sale'},
                            {dis_name:'购买', value:'buy'}
                        ]
                },
                //house_work:
                {
                    dis_name:'家政',
                    value:'house_work',
                    subs:
                        [
                            //{dis_name:'全部', value:'all'},
                            {dis_name:'清洁',value:'clean'},
                            {dis_name:'幼儿看护', value:'baby_sitting'}
                        ]
                },
                //second_hand:
                {
                    dis_name:'二手物品',
                    value:'second_hand',
                    subs:
                        [
                            //{dis_name:'全部', value:'all'},
                            {dis_name:'电脑', value:'pc'},
                            {dis_name:'手机', value:'cell_phone'}
                        ]
                }
            ];

        menuFac.copyByJson = function()
        {
            var val = JSON.stringify(menuFac.items);
            return val;
        };
        return menuFac;
    });