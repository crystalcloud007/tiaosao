/**
 * Created by Haoran on 2015/7/22.
 */
angular.module('DetailCtrl', [])
    .controller('DetailController', function($http, $routeParams, Auth, $location)
    {
        var vm = this;
        vm.success_entry = false;
        vm.success_comment = false;
        vm.success_page = false;
        vm.entry = {};
        vm.comments = {};
        vm.message_entry = '拉取内容，请稍候...';
        vm.message_comment = '拉取评论，请稍候...';
        vm.can_edit = false;
        vm.isLoggedIn = false;
        vm.page_current = 1;
        vm.pages = 0;
        vm.page_arr = [];
        vm.check_time_interval = '';

        var RetrieveComments = function(current_page)
        {
            vm.page_current = current_page;
            // 获取评论细节
            //console.log('Retrieving comments...');
            $http.get('/api/entry/comment/' + $routeParams.id + '/' + vm.page_current)
                .success(function(data)
                {
                    vm.success_page = data.success;
                    vm.success_comment = data.success;
                    vm.comments = data.comments;
                    vm.message_comment = data.message;
                })
                .error(function(data)
                {
                    vm.success_page = data.success;
                    vm.success_comment = data.success;
                    vm.message_comment = data.message;
                    vm.comments = {};
                });

            // 获取评论页码相关信息
            $http.get('/api/entry/comment_count/' + $routeParams.id)
                .success(function(data)
                {
                    if(data.success)
                    {
                        vm.pages = data.page_count;
                        //console.log("Total pages is: " + vm.pages);
                        // 循环处理页码
                        vm.page_arr = [];
                        if(vm.pages < 5)
                        {
                            for(var i = 1; i<=vm.pages;i++)
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
                                var current = vm.page_current;
                                var index = 0;
                                while(index < 5)
                                {
                                    vm.page_arr.push(current);
                                    index++;
                                    current++;
                                }
                                /*for(var i = vm.page_current; i <= vm.page_current + 4; i++)
                                {
                                    vm.page_arr.push(i);
                                }*/

                            }
                        }
                    }
                });
            //console.log('评论拉取成功：' + vm.success_comment);
            //console.log('评论内容：' + vm.comments);
        };

        var RetrieveDetail = function()
        {
            //console.log('retrieving detail....');

            // 获取帖子细节
            $http.get('/api/entry/detail/' + $routeParams.id)
                .success(function(data)
                {
                    vm.success_entry = data.success;
                    vm.entry = data.entry;
                    vm.message_entry = data.message;
                    var last_read_time = data.last_read_time;
                    vm.entryID = vm.entry._id;
                    //console.log('帖子ID: ' + vm.entryID);

                    // 处理最后查看时间
                    var t_last = new Date(Date.parse(last_read_time));
                    var t_now = new Date(Date.now());
                    var d_m_second = parseInt(t_now.getTime() - t_last.getTime());
                    //console.log('相隔时间，按毫秒算：' + d_m_second);
                    // 月份
                    if((d_m_second / (1000*3600*24*30)) >= 1)
                    {
                        vm.check_time_interval = parseInt((d_m_second / (1000*3600*24))) + '月';
                    }
                    // 天数
                    else if((d_m_second / (1000*3600*24)) >= 1)
                    {
                        vm.check_time_interval = parseInt((d_m_second / (1000*3600*24))) + '天';
                    }
                    // 按小时
                    else if((d_m_second / (1000 * 3600)) >= 1)
                    {
                        vm.check_time_interval = parseInt((d_m_second / (1000*3600))) + '小时';
                    }
                    // 按分钟
                    else if((d_m_second / (1000 * 60)) >= 1)
                    {
                        vm.check_time_interval = parseInt((d_m_second / (1000*60))) + '分钟';
                    }
                    // 秒？
                    else if((d_m_second / (1000)) >= 1)
                    {
                        vm.check_time_interval = parseInt((d_m_second / (10000))) + '秒';
                    }
                    else
                    {
                        vm.check_time_interval = '1秒';
                    }
                })
                .error(function(data, status)
                {
                    vm.success_entry = false;
                    vm.message_entry = data.message;
                    vm.entry = {};
                });

            RetrieveComments(1);

            // 查看权限
            vm.isLoggedIn = Auth.isLoggedIn();
            if(vm.isLoggedIn)
            {
                Auth.getUser()
                    .then(function(data)
                    {
                        vm.userID = data.data.user._id;
                        //console.log(data.data.user._id);
                        //console.log(vm.entry.creator);
                        //console.log(vm.userID);
                        if(vm.entry.creator == vm.userID)
                        {
                            vm.can_edit = true;
                            //console.log('当前用户可以编辑帖子');
                        }
                    });
            }

        };

        vm.AddComment = function()
        {
            vm.success_comment = false;
            $http.post('/api/entry/comment/' + vm.entryID,
                {
                    content: vm.comment_content
                })
                .success(function(data)
                {
                    if(data.success)
                    {
                        //console.log('发表成功');
                        RetrieveComments(vm.page_current);
                    }
                });
        };

        vm.pullComments = function(page)
        {
            if(page <= 1)
                page = 1;
            else if(page >= vm.pages)
                page = vm.pages;

            vm.success_comment = false;
            RetrieveComments(page);
        };

        vm.nextPage = function()
        {
            var nextPage_num = parseInt(vm.page_current) + 1;
            //console.log(nextPage_num);
            if(nextPage_num <= vm.pages)
            {
                vm.pullComments(nextPage_num);
            }
        };
        vm.prevPage = function()
        {
            var prevPage_num = parseInt(vm.page_current) - 1;
            if(prevPage_num <= 1)
                prevPage_num = 1;
            vm.pullComments(prevPage_num);
        };

        // Resolve promise
        RetrieveDetail();
    });