var gui = require('nw.gui'); // node-webkit gui
var Application = require('./application');

// определение глобальных переменных
global._ = require('underscore');

// Данные для авторизации в Вконтакте
// login, password
global.authorization_data = [
  //[chizhov.dee@gmail.com', 'chizhov777'],
  ['218027326', '79068914818', 'therapsida1'],
  ['248635139', '79226341411', 'therapsida2'],
  ['248980434', '79226315582', 'therapsida3'],
  ['249721704', '79226315535', 'therapsida4'],
  ['249723094', '79226315549', 'therapsida55']
];

// группы в Вконтакте из которых мы будем выбирать участников для спама
global.groups = [
  'easeofdisgust',
  'suicidesilenceofficial'
];

// эта основная группа с которой мы будем синхронизировать участников с базой данных
global.main_group = 'therapsida';

global.started = false;

global.current_user = {};

global.current_group;

global.added_users = 0;

$(function(){
  $('title').text(gui.App.manifest.name + ' v-' + gui.App.manifest.version);

  window.application = new Application($);

  window.application.show();
});