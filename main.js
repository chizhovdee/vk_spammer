global.$ = $;
global._ = require('underscore');
var gui = require('nw.gui');

global.logins = [
  //['chizhov_dima', 'chizhov.dee@gmail.com', 'chizhov777'],
  ['218027326', '79068914818', 'therapsida1'],
  ['248635139', '79226341411', 'therapsida2']
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

