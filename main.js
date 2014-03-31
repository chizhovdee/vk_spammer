// подключаем модули
var Spammer = require('spammer'); // основная логика программы
var gui = require('nw.gui'); // node-webkit gui
var View = require('view');

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

global.started = false; // Работа спаммера не запущена по умолчанию

var view = new View();
var spammer = new Spammer();

$(function(){
  $('title').text(gui.App.manifest.name + ' v-' + gui.App.manifest.version);

  window.app_el       = $("#application"),
  window.sidebar_el   = $('#sidebar');
  window.container_el = $("#container"),

  container.once('click', 'button.start:not(.disabled)', onStartClick);
});

function onStartClick(e){
  $(e.currentTarget).addClass('disabled');

  spammer.start();
}


// рендеры

function renderTemplate(filename, args){
  return view.render(filename, _.extend({}, this, args));
}

function renderContent(){
  container_el.html(renderTemplate('content.ejs'));
}

function renderSidebar(){
  sidebar_el.html(renderTemplate('sidebar.ejs'));
}

// _Class.prototype.renderModal = function(img, sid, callback){
//   var self = this;

//   this.modal.html(this.renderTemplate('modal.ejs', {img: img, sid: sid}));

//   this.modal.show();

//   this.modal.find('button.submit').one('click', function(){
//     self.modal.hide();

//     callback(self.modal.find('input[name=captcha_text]').val());
//   });
// }

// Функции для вывода операций в окно программы

function primaryLog(text){
  var date = new Date();
  var time = date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
  var log = this.container.find('.primary.log .text');

  log.text('');

  log.append(time + " - " + text + "</br>");

  this.secondaryLog(text)
}

function secondaryLog(text){
  var date = new Date();
  var time = date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();

  this.container.find('.secondary.log .text').append(time + " - " + text + "</br>");
}
