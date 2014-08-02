global.$ = $;
global._ = require('underscore');
var gui = require('nw.gui');

global.logins = [
  //['vk_id', 'login', 'password'],
];

global.login_number = 0;

global.currentUser = {};

global.auth_user;

global.groups = [
  'easeofdisgust'
];

global.group_number = 0;

global.currentGroup = {};

global.success_added = 0;

//var User = require('user');
var Application = require('./application');

// global.currentUser = new User();

$(function(){
  $('title').text(gui.App.manifest.name + ' v-' + gui.App.manifest.version);

  new Application().show();
});

