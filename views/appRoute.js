/**
 * Created by Haoran on 2015/7/21.
 */
angular.module('appRoute',['ngRoute'])
    .config(function($routeProvider, $locationProvider)
    {
        $locationProvider.html5Mode(true);
        $routeProvider
            .when('/',
            {
                templateUrl: 'partial/home.html',
                controller: 'HomeController',
                controllerAs:'Home'
            })
            .when('/login',
            {
                templateUrl:'partial/login.html',
                controller:'HomeController',
                controllerAs:'Home'
            })
            .when('/logout',
            {
                templateUrl:'partial/logout.html',
                resolve:
                {
                    // Auth 是服务的名字！
                    lg: function(Auth)
                    {
                        Auth.logout();
                    }
                }
            })
            .when('/new_entry',
            {
                templateUrl: 'partial/entry_new.html',
                controller:'NewEntryController',
                controllerAs:'NewEntry',
            })
            .when('/edit_entry/:id',
            {
                templateUrl: 'partial/entry_edit.html',
                controller:'EditEntryController',
                controllerAs:'EditEntry',
            })
            .when('/signup',
            {
                templateUrl:'partial/signup.html',
                controller:'HomeController',
                controllerAs:'Home'
            })
            .when('/list/:cate_main/:cate_sub/:page_num',
            {
                templateUrl: 'partial/entry_list.html',
                controller: 'ListController',
                controllerAs: 'List',
            })
            .when('/list_self/:id/:page_num',
            {
                templateUrl: 'partial/entry_list.html',
                controller: 'ListSelfController',
                controllerAs: 'List',
            })
            .when('/detail/:id',
            {
                templateUrl:'partial/entry_detail.html',
                controller:'DetailController',
                controllerAs:'Detail'
            })
            .when('/user/profile',
            {
                templateUrl:'partial/user_profile.html',
                controller:'ProfileController',
                controllerAs:'Profile'
            })
            .when('/user/edit',
            {
                templateUrl:'partial/user_profile_edit.html',
                controller:'ProfileEditController',
                controllerAs:'Profile'
            })
            .otherwise(
            {
                redirectTo:'/',
            });
    });