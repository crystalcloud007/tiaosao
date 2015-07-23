/**
 * Created by Haoran on 2015/7/22.
 */
angular.module('HomeCtrl',[])
    // 主页菜单项，所有项目都是一个二元体，由name和value组成
    // value用于显示在网页上，name用于记录在数据库中，或者查询使用。
    .controller('HomeController', function($http, $rootScope, $location, Auth, MenuItem)
    {
        var vm = this;
        vm.password = '';
        vm.signupData =
        {
            username:'',
            password:'',
            realname:'',
            contact:'',
            email:''
        };
        vm.loginData =
        {
            username:'',
            password:''
        };
        vm.error = '';
        vm.loggedIn = Auth.isLoggedIn();
        $rootScope.$on("$routeChangeStart", function()
        {
            vm.loggedIn = Auth.isLoggedIn();
            Auth.getUser()
                .then(function(data)
                {
                    vm.user = data.data.user;
                    //console.log(data.data.user.username);
                });
        });

        vm.editPassword = function()
        {
            vm.error = '';
            $http.post('/api/user/password',{oldPassword: vm.oldPassword, password: vm.password})
                .success(function(data)
                {
                    vm.password='';
                    if(data.success)
                    {
                        $window.localStorage.setItem('token', data.token);
                        $location.path('/');
                    }
                    else
                    {
                        vm.error = data.message;
                    }
                });
        };


        vm.signup = function()
        {
            vm.processing = true;
            $http.post('/api/user/signup',
                {
                    username: vm.signupData.username,
                    password: vm.signupData.password,
                    realname: vm.signupData.realname,
                    contact: vm.signupData.contact,
                    email: vm.signupData.email,
                })
                .success(function(data)
                {
                    if(data.success)
                    {
                        $window.localStorage.setItem('token', data.token);
                        $location.path('/');
                    }
                    else
                    {
                        vm.error = data.message;
                    }
                });
        };

        vm.doLogin = function()
        {
            vm.processing = true;
            vm.error = "";
            Auth.login(vm.loginData.username, vm.loginData.password)
                .success(function(data)
                {
                    vm.processing = false;
                    Auth.getUser()
                        .then(function(data)
                        {
                            vm.user = data.data;
                        });

                    if(data.success)
                    {
                        $location.path("/");
                    }
                    else
                    {
                        vm.error = data.message;
                    }
                });
        };

        vm.doLogout = function()
        {
            Auth.logout();
            //$location.path("/logout");
        };

        // 不要直接引用对象，要制作一个对象的copy，以防误操作。
        vm.menu_items = JSON.parse(MenuItem.copyByJson());
    })
    .controller('ProfileController', function($http)
    {
        var vm = this;
        vm.success_profile = false;
        var checkProfile = function()
        {
            vm.error = '';
            $http.get('/api/user/me')
                .success(function(data)
                {
                    vm.success_profile = data.success;
                    if(data.success)
                    {
                        vm.profile = data.user;
                        //console.log(vm.profile);
                    }
                    else
                    {
                        vm.error = data.message;
                    }
                });
        };

        checkProfile();
    })
    .controller('ProfileEditController', function($location, Auth)
    {
        var vm = this;
        vm.success = false;
        vm.error = '';
        vm.editProfile = function()
        {
            vm.error = '';
            vm.success = false;
            Auth.editUser(vm.editData.realname, vm.editData.contact, vm.editData.email)
                .success(function(data)
                {
                    vm.success = data.success;
                    if(data.success)
                    {
                        $location.path('/');
                    }
                    else
                    {
                        vm.error = data.message;
                    }
                });
        };
    });