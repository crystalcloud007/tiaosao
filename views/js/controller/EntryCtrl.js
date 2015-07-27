/**
 * Created by Haoran on 2015/7/21.
 */
angular.module('EntryCtrl',[])
    // 此处不使用$scope是因为怕在混合运用中，各种CTRL的$scope会发生混淆.
    .controller('ListController', function($http, $routeParams, $location)
    {
        var vm = this;
        vm.success = false;
        vm.success_page = false;
        vm.entries={};
        vm.pages = 0;
        vm.page_current = 1;
        vm.page_arr = [];
        vm.cate_main = 'all';
        vm.cate_sub = 'all';
        var RetrieveList = function()
        {
            var hostName = $location.host();
            var sub_domain_index = hostName.split('.')[0];
            console.log('Host name: ' + hostName + ', index: ' + sub_domain_index + '.');
            //console.log('retrieving....');
            $http.get('/api/entry/list/' + $routeParams.cate_main + '/'
                        + $routeParams.cate_sub + '/' + $routeParams.page_num)
                .success(function(data)
                {
                    //console.log(data.success);
                    vm.success = data.success;
                    if(data.success)
                    {
                        vm.entries = data.entries;
                        vm.cate_main = $routeParams.cate_main;
                        vm.cate_sub = $routeParams.cate_sub;
                    }
                });
            //console.log('getting page count....');
            $http.get('/api/entry/entry_count/' + $routeParams.cate_main + '/' + $routeParams.cate_sub)
                .success(function(data)
                {
                    vm.page_arr = [];
                    vm.success_page = data.success;
                    if(data.success)
                    {
                        //console.log('应该有的页数是：' + data.page_count);

                        vm.pages = data.page_count;
                        // 此处，page_current变成字符串了
                        vm.page_current = $routeParams.page_num;
                        //console.log('当前页面：' + vm.page_current);

                        // 处理页码逻辑
                        vm.page_arr = [];
                        if(vm.pages < 5)
                        {
                            for(var i = 1; i<=vm.pages; i++)
                                vm.page_arr.push(i);
                        }
                        else
                        {
                            if(vm.page_current >= vm.pages - 4)
                            {
                                for(var i = vm.pages - 4; i <= vm.pages; i++)
                                {
                                    vm.page_arr.push(i);
                                }
                            }
                            else
                            {
                                var page_max = parseInt(vm.page_current) + 4;
                                console.log('当前页面后四页：' + page_max);
                                for(var i = parseInt(vm.page_current); i <= parseInt(vm.page_current) + 4; i++)
                                {
                                    vm.page_arr.push(i);
                                }
                                /*var current = parseInt(vm.page_current);
                                var index = 0;
                                while(index < 5)
                                {
                                    vm.page_arr.push(current);
                                    index++;
                                    current++;
                                }*/
                            }
                        }
                    }
                });
        };

        vm.nextPage = function()
        {
            var nextPage_num = parseInt(vm.page_current) + 1;
            //console.log(nextPage_num);
            if(nextPage_num <= vm.pages)
            {
                var toRoute = '/list/' + vm.cate_main + '/' + vm.cate_sub + '/' + nextPage_num;
                //console.log(toRoute);
                $location.path(toRoute);
            }
        };
        vm.prevPage = function()
        {
            var prevPage_num = parseInt(vm.page_current) - 1;
            if(prevPage_num <= 1)
                prevPage_num = 1;
            //console.log(nextPage_num);
            var toRoute = '/list/' + vm.cate_main + '/' + vm.cate_sub + '/' + prevPage_num;
            //console.log(toRoute);
            $location.path(toRoute);
        };

        // Resolve promise.
        RetrieveList();
    })
    .controller('ListSelfController', function($http, $routeParams, $location)
    {
        var vm = this;
        vm.success = false;
        vm.success_page = false;
        vm.entries={};
        vm.pages = 0;
        vm.page_current = 1;
        vm.page_arr = [];
        var RetrieveList = function()
        {
            //console.log('retrieving....');
            $http.get('/api/entry/list_self/' + $routeParams.id + '/' + $routeParams.page_num)
                .success(function(data)
                {
                    //console.log(data.success);
                    vm.success = data.success;
                    if(data.success)
                    {
                        vm.entries = data.entries;
                        vm.cate_main = $routeParams.cate_main;
                        vm.cate_sub = $routeParams.cate_sub;
                    }
                });
            //console.log('getting page count....');
            $http.get('/api/entry/entry_count_self/' + $routeParams.id)
                .success(function(data)
                {
                    vm.page_arr = [];
                    vm.success_page = data.success;
                    if(data.success)
                    {
                        //console.log('应该有的页数是：' + data.page_count);

                        vm.pages = data.page_count;
                        // 此处，page_current变成字符串了
                        vm.page_current = $routeParams.page_num;
                        //console.log('当前页面：' + vm.page_current);

                        // 处理页码逻辑
                        vm.page_arr = [];
                        if(vm.pages < 5)
                        {
                            for(var i = 1; i<=vm.pages; i++)
                                vm.page_arr.push(i);
                        }
                        else
                        {
                            if(vm.page_current >= vm.pages - 4)
                            {
                                for(var i = vm.pages - 4; i <= vm.pages; i++)
                                {
                                    vm.page_arr.push(i);
                                }
                            }
                            else
                            {
                                var page_max = parseInt(vm.page_current) + 4;
                                //console.log('当前页面后四页：' + page_max);
                                for(var i = parseInt(vm.page_current); i <= parseInt(vm.page_current) + 4; i++)
                                {
                                    vm.page_arr.push(i);
                                }
                                /*var current = parseInt(vm.page_current);
                                 var index = 0;
                                 while(index < 5)
                                 {
                                 vm.page_arr.push(current);
                                 index++;
                                 current++;
                                 }*/
                            }
                        }
                    }
                });
        };

        vm.nextPage = function()
        {
            var nextPage_num = parseInt(vm.page_current) + 1;
            //console.log(nextPage_num);
            if(nextPage_num <= vm.pages)
            {
                var toRoute = '/list_self/' + nextPage_num;
                //console.log(toRoute);
                $location.path(toRoute);
            }
        };

        // Resolve promise.
        RetrieveList();
    })
    .controller('NewEntryController', function($http, MenuItem, $location, $scope)
    {
        var vm = this;
        vm.error = '';
        // 不要直接引用对象，要制作一个对象的copy，以防误操作。
        vm.menu_items = JSON.parse(MenuItem.copyByJson());
        vm.select_main={};
        vm.select_sub={};
        vm.has_main = false;
        vm.has_sub = false;
        vm.entry = {};
        var shiftCategory = function()
        {
            vm.menu_items.shift();
            for(var i = 0; i < vm.menu_items.length; i++)
            {
                vm.menu_items[i].subs.shift();
                //console.log(vm.menu_items[i]);
            }
            //console.log(vm.menu_items);
            //console.log('shifting....');
        };
        vm.newEntry = function()
        {
            $http.post('/api/entry/new/all',
                {
                    cate_main: vm.entry.cate_main,
                    cate_sub: vm.entry.cate_sub,
                    title: vm.entry.title,
                    price: vm.entry.price,
                    desc: vm.entry.desc,
                    content: vm.entry.content
                })
                .success(function(data)
                {
                    if(data.success)
                    {
                        $location.path('/detail/' + data.id);
                    }
                    else
                    {
                        vm.error = data.message;
                    }
                });
        };

        vm.changeMain = function()
        {
            vm.entry.cate_main = vm.select_main.value;
            //console.log(vm.entry.cate_main);
            vm.has_main = true;
            vm.entry.cate_sub = null;
        };
        vm.changeSub = function()
        {
            //console.log(vm.select_sub);
            vm.entry.cate_sub = vm.select_sub.value;
            vm.has_sub = true;
            //console.log(vm.entry.cate_sub);
        };

        //shiftCategory();
    })
    .controller('EditEntryController', function($http, $routeParams, $location)
    {
        var vm = this;
        vm.error = '';
        vm.edit = function()
        {
            $http.post('/api/entry/edit/all/' + $routeParams.id,
                {
                    title: vm.entry.title,
                    price: vm.entry.price,
                    contact: vm.entry.contact,
                    desc: vm.entry.desc,
                    content: vm.entry.content
                })
                .success(function(data)
                {
                    if(data.success)
                    {
                        $location.path('/detail/' + data.id + '/1');
                    }
                    else
                    {
                        vm.error = data.message;
                    }
                });;
        };
    });