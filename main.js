var gui = require('nw.gui'); // node-webkit gui
var Application = require('./application');

// определение глобальных переменных
global._ = require('underscore');

// Данные для авторизации в Вконтакте
// login, password
global.authorization_data = [
  //[chizhov.dee@gmail.com', 'chizhov777'],
  ['79068914818', 'therapsida1'],
  ['79226341411', 'therapsida2']
];

// группы в Вконтакте из которых мы будем выбирать участников для спама
global.groups = [
  'easeofdisgust'
];

// эта основная группа с которой мы будем синхронизировать участников с базой данных
global.main_group = 'therapsida';

global.started = false;

global.current_user = {};

$(function(){
  $('title').text(gui.App.manifest.name + ' v-' + gui.App.manifest.version);

  window.application = new Application($);

  window.application.show();
});