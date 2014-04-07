// подключаем модули
var Spammer = require('spammer'); // основная логика программы
var View = require('view');

var view = new View();
var spammer = new Spammer();

var $;

var Application = function(jQery){
  $ = jQery;
  this.document_el  = $(window.document);
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

  global.started = true;

  this.show();

  spammer.start();
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

  this.document_el.scrollTop(this.document_el.height());
}

// рендеры

_Class.prototype.showCaptchaModal = function(img, callback){
  var self = this;

  this.sidebar_el.find('.modal').html(this.renderTemplate('modal.ejs', {img: img}));

  this.sidebar_el.find('.modal input[name=captcha_text]').focus();

  var returnResult = function(){
    self.sidebar_el.off('click', '.modal .submit', returnResult);

    callback(self.sidebar_el.find('.modal input[name=captcha_text]').val());
  }

  var onKeyPress = function(e){
    if(e.keyCode && e.keyCode == 13){
      returnResult();

      self.sidebar_el.off('keypress', '.modal [name=captcha_text]', onKeyPress);

      self.sidebar_el.find('.modal').html('');
    }
  }

  this.sidebar_el.one('click', '.modal .submit', returnResult);
  this.sidebar_el.on('keypress', '.modal [name=captcha_text]', onKeyPress);
}

// Функции для вывода операций в окно программы

module.exports = _Class;