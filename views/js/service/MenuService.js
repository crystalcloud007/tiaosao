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
                {
                    value:'全部',
                    name:'all',
                    subs: [{value:'全部', name:'all'}]
                },
                //real_estate:
                {
                    value: '房产',
                    name:'real_estate',
                    subs:
                        [
                            {value:'全部', name:'all'},
                            {value:'出租', name:'rent'},
                            {value:'出售', name:'sale'},
                            {value:'购买', name:'buy'}
                        ]
                },
                //house_work:
                {
                    value:'家政',
                    name:'house_work',
                    subs:
                        [
                            {value:'全部', name:'all'},
                            {value:'清洁',name:'clean'},
                            {value:'幼儿看护', name:'baby_sitting'}
                        ]
                },
                //second_hand:
                {
                    value:'二手物品',
                    name:'second_hand',
                    subs:
                        [
                            {value:'全部', name:'all'},
                            {value:'电脑', name:'pc'},
                            {value:'手机', name:'cell_phone'}
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