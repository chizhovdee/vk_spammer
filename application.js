// подключаем модули
var Spammer = require('spammer'); // основная логика программы
var View = require('view');

var view = new View();
var spammer = new Spammer();

var $;

var Application = function(jQery){
  $ = jQery;
  this.app_el       = $("#application");
  this.sidebar_el   = $('#sidebar');
  this.container_el = $("#container");

  this.onStartClick = this.onStartClick.bind(this);

  this.container_el.one('click', 'button.start:not(.disabled)', this.onStartClick);
}

_Class = Application;

_Class.prototype.renderTemplate = function(filename, args){
  return view.render(filename, _.extend({}, this, args));
}

_Class.prototype.renderContent = function(){
  this.container_el.html(this.renderTemplate('content.ejs'));
}

_Class.prototype.renderSidebar = function(){
  this.sidebar_el.html(this.renderTemplate('sidebar.ejs'));
}

_Class.prototype.show = function(){
  this.renderContent();
  this.renderSidebar();
}


_Class.prototype.onStartClick = function (e){
  $(e.currentTarget).addClass('disabled');

  spammer.start();

  global.started = true;

  this.show();
}

_Class.prototype.primaryLog = function primaryLog(text){
  var date = new Date();
  var time = date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
  var log = this.container_el.find('.primary.log .text');

  log.text('');

  log.append(time + " - " + text + "</br>");

  this.secondaryLog(text)
}

_Class.prototype.secondaryLog = function(text){
  var date = new Date();
  var time = date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();

  this.container_el.find('.secondary.log .text').append(time + " - " + text + "</br>");
}

// рендеры

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

module.exports = _Class;