/**
 * Created by Haoran on 2015/7/21.
 */
var app = angular.module('app',['HomeCtrl','DetailCtrl','EntryCtrl','AuthService', 'MenuService','appRoute']);

app.config(function($httpProvider)
{
    $httpProvider.interceptors.push('AuthInterceptor');
});