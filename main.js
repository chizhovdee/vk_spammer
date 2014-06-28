var gui = require('nw.gui'); // node-webkit gui
var Application = require('./application');

// определение глобальных переменных
global._ = require('underscore');

// Данные для авторизации в Вконтакте
// login, password
global.authorization_data = [
  [1, '248980434', '79226315582', 'therapsida333333'],
  [2, '249721704', '79226315535', 'therapsida444444'],
  [3, '249723094', '79226315549', 'therapsida555555'],
  [4, '249950698', '79227124271', 'therapsida6666'],
  [5, '249952224', '79227124259', 'therapsida777777'],
  [6, '218027326', '79068914818', 'therapsida1111'],
  [7, '248635139', '79226341411', 'therapsida22222'],
  [8, '250827741', '79227123935', 'therapsida8888'],
  [9, '250829383', '79227133142', 'therapsida9999'],
  [10, '251250392', '79227254362', 'therapsida101010']
];

// группы в Вконтакте из которых мы будем выбирать участников для спама
global.groups = [
  //'behemoth_ekb',
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