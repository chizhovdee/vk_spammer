var gui = require('nw.gui'); // node-webkit gui
var Application = require('./application');

// определение глобальных переменных
global._ = require('underscore');

// Данные для авторизации в Вконтакте
// login, password
global.authorization_data = [
  [1, '248980434', '79226315582', 'therapsida3'],
  //[2, '249721704', '79226315535', 'therapsida44'], locked
  //[3,'249723094', '79226315549', 'therapsida55'], locked 11.04.14 10:45
  [4, '249950698', '79227124271', 'therapsida6'],
  [5, '249952224', '79227124259', 'therapsida7'],
  [6, '218027326', '79068914818', 'therapsida1'],
  [7, '248635139', '79226341411', 'therapsida222']
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