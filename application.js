var util = require('util');
var EventEmitter = require('events').EventEmitter;
var emitter = new EventEmitter();
var VK  = require('vk');
var View = require('view');
var view = new View();
var MongoClient = require('mongodb').MongoClient;

var Application = function (){
  this.onStartClick = this.onStartClick.bind(this);
  this.vkLoginResponse = this.vkLoginResponse.bind(this);
  this.vkLogOutResponse = this.vkLogOutResponse.bind(this);
  this.onResponseMembersOfGroup = this.onResponseMembersOfGroup.bind(this);

  this.app_el = $("#application");
  this.container = $("#container");
  this.sidebar = $('#sidebar');
  this.modal = $('#modal');

  this.started = false;

  this.addEventListeners();
}

var _class = Application;

// события

_class.prototype.addEventListeners = function () {
  this.container.on('click', 'button.start:not(.disabled)', this.onStartClick);

  emitter.on('response_members_of_group', this.onResponseMembersOfGroup);
  emitter.on('synchronized_data_with_database', this.onSynchronizedDataWithDb)
}

// _class.prototype.removeEventListeners = function(){
//   emitter.remove('get_group_members_again')
// }

// рендеры

_class.prototype.renderTemplate = function (filename, args){
  return view.render(filename, _.extend({}, this, args));
}

_class.prototype.renderContent = function(){
  this.container.html(this.renderTemplate('content.ejs'));
}

_class.prototype.renderSidebar = function(){
  this.sidebar.html(this.renderTemplate('sidebar.ejs'));
}

_class.prototype.renderModal = function(img, sid, callback){
  var self = this;

  this.modal.html(this.renderTemplate('modal.ejs', {img: img, sid: sid}));

  this.modal.show();

  this.modal.find('button.submit').one('click', function(){
    self.modal.hide();

    callback(self.modal.find('input[name=captcha_text]').val());
  });
}

_class.prototype.show = function (){
  this.renderSidebar();
  this.renderContent();
}

_class.prototype.primaryLog = function(text){
  var date = new Date();
  var time = date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
  var log = this.container.find('.primary.log .text');

  log.text('');

  log.append(time + " - " + text + "</br>");

  this.secondaryLog(text)
}

_class.prototype.secondaryLog = function(text){
  var date = new Date();
  var time = date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();

  this.container.find('.secondary.log .text').append(time + " - " + text + "</br>");
}


_class.prototype.onStartClick = function(e) {
  var self = this;

  $(e.currentTarget).addClass('disabled');

  self.started = true;

  self.show();

  this.connectToDb(function(db){
    self.db = db;

    self.primaryLog('Приложение запущено!');

    self.secondaryLog('Подключение к базе данных прошло успешно!');

    self.synchronizeDataWithDb();

  });
}

_class.prototype.synchronizeDataWithDb = function(){
  var self = this;
  var group_id = 'therapsida';

  var getMembers = function(offset){

    if(!offset) offset = 0;

    self.primaryLog('Получение участников группы <strong>' + group_id + '</strong>');

    var options = {
      gid: group_id,
      access_token: currentUser.access_token,
      count: 1000,
      sort: 'time_desc'
    }

    if(offset > 0){
      _.extend(options, {offset: offset});
    }

    VK.request('groups.getMembers',
      options,
      function(error, response){
        if(error){
          self.secondaryLog('Произошла ошибка получения данных группы <strong>' + group_id + '</strong>');

          self.secondaryLog(error.error_msg);
          self.secondaryLog(util.inspect(error));

        } else {
          self.secondaryLog('Получение ' + (offset + response.users.length) + ' из ' + response.count + ' участников группы <strong>' + group_id + '</strong> прошло успешно');

          _.extend(response, {offset: offset + response.users.length});

          addMembersToDb(response);
        }
      }
    );
  }

  var addMembersToDb = function(response) {
    var db_users = self.db.collection('users');

    self.secondaryLog('Синхронизация полученных данных с базой данной...');

    self.filterByDb(response.users, function(user_ids){
      db_users.insert(
      _.map(user_ids, function(id){ return {_id: id} }),
        function(err, objects){
          if (err) self.secondaryLog(err.message);

          self.secondaryLog('Синхронизация данных с базой данной завершена');

          if(response.count > response.offset){
            setTimeout(function(){
              getMembers(response.offset);
            }, 1000);

          } else {
            self.primaryLog('Все участники группы обработаны.');

            //emitter.emmit('synchronized_data_with_database');
          }
        }
      );
    });
  }

  getMembers();
}

_class.prototype.onSynchronizedDataWithDb = function(){
  self.secondaryLog('Синхронизация с базой данных завершена.');

  self.secondaryLog('Предварительный выход из аккаунта.');

  VK.logOut(function(message){
    currentUser = {}; // сброс пользователя

    self.secondaryLog(message);

    setTimeout(function(){
      self.vkLogin();
    }, 2000); // выдерживаем интервал после выхода

  });
}


_class.prototype.vkLogin = function (){
  auth_user = global.logins[global.login_number];

  if(!auth_user) {
    this.secondaryLog('Пользователи все обработаны');

    this.db.close();

    return
  }

  window.console.log(global.login_number);
  window.console.log(auth_user);
  var login = auth_user[1];
  var pass  = auth_user[2];

  global.login_number += 1 // сдвигаем на следующего пользователя

  // if(global.logins.length > global.login_number + 1){
  //   global.login_number += 1 // сдвигаем на следующего пользователя
  // }
  // else {
  //   global.login_number = 0; // передвагаем на начала списка
  // }

  window.console.log(global.login_number);

  this.primaryLog('Идет авторизация пользователя <strong>' + auth_user[0] + '</strong>');

  VK.authorize(login, pass, this.vkLoginResponse);
}

_class.prototype.vkLoginResponse = function(error, response) {
  var self = this;

  if(error) {
    this.primaryLog('Пользователь не авторизовался!');
    this.secondaryLog(util.inspect(error));

    this.vkLogin();

  } else if(response) {
    currentUser = response;

    this.primaryLog('Пользователь <strong>' + currentUser.user_id + '</strong> авторизовался успешно!');
    this.renderSidebar();

    setTimeout(function(){
      self.getProfile();
    }, 1000); //Выдерживаем

  } else {
    this.primaryLog('Пользователь не авторизовался!');
    this.secondaryLog('Метод авторизации не вернул никаких данных для пользователя <strong>' + auth_user[0] + '</strong>');
    this.secondaryLog('Начинаем авторизацию следующего пользователя');

    this.vkLogin();
  }
}

_class.prototype.vkLogout = function (){
  VK.logOut(this.vkLogOutResponse);
}

_class.prototype.vkLogOutResponse = function(message){
  currentUser = {};
  this.primaryLog(message);
}


_class.prototype.getProfile = function(){
  var self = this;

  VK.request('getProfiles',
    {
      access_token: currentUser.access_token,
      fields: 'counters'
    },
    function(error, response){
      if(error){
        self.secondaryLog('Произошла ошибка получения данных профиля пользователя <strong>' + currentUser.user_id + '</strong>');

        self.secondaryLog(error.error_msg);
        self.secondaryLog(util.inspect(error));

      } else {
        window.console.log(response[0]);
        _.extend(currentUser, response[0]);

        self.secondaryLog('Данные получены успешно');
        //self.secondaryLog(util.inspect(currentUser));
        self.secondaryLog('Количество друзей - <strong>' + currentUser.counters.friends + '</strong>');

        setTimeout(function(){
          self.getFrendIds();
        }, 2000);
      }
    }
  );
}

_class.prototype.getFrendIds = function(){
  var self = this;

  self.secondaryLog('Делаем запрос на получение ids друзей пользователя <strong>' + currentUser.user_id + '</strong>');

  VK.request('friends.get',
    {
      access_token: currentUser.access_token
    },
    function(error, response){
      if(error){
        self.secondaryLog('Произошла ошибка получения ids друзей пользователя <strong>' + currentUser.user_id + '</strong>');

        self.secondaryLog(error.error_msg);
        self.secondaryLog(util.inspect(error));

      } else {
        self.secondaryLog('Получение ids друзей пользователя <strong>' + currentUser.user_id + '</strong> прошло успешно.');

        _.extend(currentUser, {friend_ids: response});

        self.updateUsersDataInDb();
      }
    }
  );
}

_class.prototype.updateUsersDataInDb = function(){
  var self = this;

  this.secondaryLog('Синхронизация полученных данных с базой данной...');

  var users = this.db.collection('users');

  this.filterByDb(currentUser.friend_ids, function(friend_ids){
    users.insert(
    _.map(friend_ids, function(id){ return {_id: id} }),
      function(err, objects){
        if (err) self.secondaryLog(err.message);

        self.secondaryLog('Синхронизация данных с базой данной завершена');

        self.startSpammWork();
      }
    );
  });

}

_class.prototype.startSpammWork = function() {
  var self = this;
  var members = [];
  var offset = 0;

  var group_id = global.groups[global.group_number];

  if(global.groups.length > global.group_number + 1){
    global.group_number += 1 // сдвигаем на следующего пользователя
  } else {
    global.group_number = 0; // передвагаем на начала списка
  }

  this.primaryLog('Получение данных группы <strong>' + group_id + '</strong>');

  this.getMembersOfGroup(group_id, 0);
}

_class.prototype.getMembersOfGroup = function(group_id, offset){
  var self = this;

  this.primaryLog('Получение участников группы <strong>' + group_id + '</strong>');

  var options = {
    gid: group_id,
    access_token: currentUser.access_token,
    count: 100,
    sort: 'time_desc'
  }

  if(offset > 0){
    _.extend(options, {offset: offset});
  }

  VK.request('groups.getMembers',
    options,
    function(error, response){
      if(error){
        self.secondaryLog('Произошла ошибка получения данных группы <strong>' + group_id + '</strong>');

        self.secondaryLog(error.error_msg);
        self.secondaryLog(util.inspect(error));

      } else {
        self.secondaryLog('Получение участников группы <strong>' + group_id + '</strong> прошло успешно');

        setTimeout(function(){
          emitter.emit('response_members_of_group',
          _.extend(response, {
              offset: offset + response.users.length,
              group_id: group_id
            })
          );
        }, 2000);
      }
    }
  );
}

_class.prototype.onResponseMembersOfGroup = function(members_group_response) {
  var self = this;

  window.console.log(members_group_response.offset);

  this.filterByDb(members_group_response.users, function(users){
    VK.request('users.get',
      {
        uids: users.join(','),
        access_token: currentUser.access_token,
        fields: 'online'
      },
      function(error, response){
        if(error){
          self.secondaryLog('Произошла ошибка получения расширенной информации участников группы <strong>' + members_group_response.group_id + '</strong>');

          self.secondaryLog(error.error_msg);
          self.secondaryLog(util.inspect(error));

        } else {
          self.secondaryLog('Получение расширенной информации участников группы <strong>' + members_group_response.group_id + '</strong> прошло успешно');

          self.addToFriends(response, 0);
        }
      }
    );
  });

  var getGroupMembersAgain = function(){
    if(members_group_response.count > members_group_response.offset){
      setTimeout(function(){
        self.getMembersOfGroup(members_group_response.group_id, members_group_response.offset);
      }, 2000);
    } else {
      self.primaryLog('Все участники группы обработаны.');

      // VK.logOut(function(message){
      //   currentUser = {}; // сброс пользователя

      //   self.secondaryLog(message);

      //   setTimeout(function(){
      //     self.vkLogin();
      //   }, 2000); // выдерживаем интервал после выхода

      // });
    }
  }

  emitter.removeListener('get_group_members_again', getGroupMembersAgain);

  emitter.once('get_group_members_again', getGroupMembersAgain);
}

_class.prototype.filterByDb = function(user_ids, callback){
  window.console.log(user_ids.length);
  var db_users = this.db.collection('users');
  var db_user_ids;
  var filtered_user_ids = [];

  db_users.find({_id: {$in: user_ids}}).toArray(function(err, objects){
    window.console.log('Проверка пользователей в базе');
    window.console.log(objects);

    db_user_ids = _.map(objects, function(o){ return o._id });

    user_ids.forEach(function(id){
      if(!_.contains(db_user_ids, id)){
        filtered_user_ids.push(id);
      }
    });

    window.console.log(filtered_user_ids.length);

    callback(filtered_user_ids);
  });
}

_class.prototype.addToFriendAfterCaptcha = function(user_id, text, captcha_sid, users, count){
  var self = this;

  VK.request('friends.add',
    {
      uid: user_id,
      captcha_sid: captcha_sid,
      captcha_key: text,
      access_token: currentUser.access_token
    },
    function(error, response){
      if(error){
        //self.secondaryLog('Произошла ошибка получения расширенной информации участников группы <strong>' + members_group_response.group_id + '</strong>');

        window.console.log(error.error_code);

        if(error.error_code == 1 || error.error_code == 0){
          // превышен лими добавления в друзья вызодим из пользователя

          self.secondaryLog('Превышен лимит на добавления в друзья!');

          VK.logOut(function(message){
            currentUser = {}; // сброс пользователя

            self.secondaryLog(message);

            setTimeout(function(){
              self.vkLogin();
            }, 2000); // выдерживаем интервал после выхода

          });

        } else if(error.error_code == 14){
          self.secondaryLog('Cнова пришла капча на добавление пользователя <strong>' + user_id + '</strong> в друзья');

          setTimeout(function(){
            if(users.length > count + 1){
              self.addToFriends(users, count);
            } else {
              emitter.emit('get_group_members_again');
            }

          }, 5000);

        } else {
          self.secondaryLog(error.error_msg);
          self.secondaryLog(util.inspect(error));
        }

      } else {
        //self.secondaryLog('Получение расширенной информации участников группы <strong>' + members_group_response.group_id + '</strong> прошло успешно');

        window.console.log(response);

        global.success_added += 1;

        self.renderSidebar();
        var db_users = self.db.collection('users');

        db_users.insert({_id: user_id}, function(err, objects){
          if (err) self.secondaryLog(err.message);

          self.secondaryLog('Добавлен новый пользователь в базу данных.');
        });

        setTimeout(function(){
          if(users.length > count + 1){
            self.addToFriends(users, count);
          } else {
            emitter.emit('get_group_members_again');
          }

        }, 5000);
      }
    }
  );
}

_class.prototype.addToFriends = function(users, count){
  var self = this;
  var user;
  var db_users = this.db.collection('users');


  do {
    user = users[count];
    count += 1;

  } while(user && user.online == 0)

  if(user && user.online == 1){
    this.secondaryLog('Идет добавление пользователя <strong>' + user.uid + '</strong> в друзья');

    VK.request('friends.add',
      {
        uid: user.uid,
        access_token: currentUser.access_token
      },
      function(error, response){
        if(error){
          //self.secondaryLog('Произошла ошибка получения расширенной информации участников группы <strong>' + members_group_response.group_id + '</strong>');

          window.console.log(error.error_code);

          if(error.error_code == 1 || error.error_code == 0){
            // превышен лими добавления в друзья вызодим из пользователя

            self.secondaryLog('Превышен лимит на добавления в друзья!');

            VK.logOut(function(message){
              currentUser = {}; // сброс пользователя

              self.secondaryLog(message);

              setTimeout(function(){
                self.vkLogin();
              }, 2000); // выдерживаем интервал после выхода

            });

          } else if(error.error_code == 14){
            self.secondaryLog('Пришла капча на добавление пользователя <strong>' + user.uid + '</strong> в друзья');
           // self.secondaryLog("<img src='" + error.captcha_img+ "' />");

            if(currentUser.captcha){
              currentUser.captcha += 1;
            } else {
              currentUser.captcha = 1;
            }

            self.renderSidebar();

            // setTimeout(function(){
            //   if(users.length > count + 1){
            //     self.addToFriends(users, count);
            //   } else {
            //     emitter.emit('get_group_members_again');
            //   }

            // }, 10000);

            self.renderModal(error.captcha_img, error.captcha_sid, function(text){

              self.addToFriendAfterCaptcha(user.uid, text, error.captcha_sid, users, count)
            });

            // var delay = currentUser.captcha < 10 ? 5000 : currentUser.captcha * 1000;

            // if(currentUser.captcha < 10){
            //   setTimeout(function(){
            //     if(users.length > count + 1){
            //       self.addToFriends(users, count);
            //     } else {
            //       emitter.emit('get_group_members_again');
            //     }

            //   }, delay);

            // } else {

            //   self.secondaryLog('Достигнут лимит капчи. Делем выход.');

            //   VK.logOut(function(message){
            //     currentUser = {}; // сброс пользователя

            //     self.secondaryLog(message);

            //     setTimeout(function(){
            //       self.vkLogin();
            //     }, 2000); // выдерживаем интервал после выхода

            //   });
            // }


          } else {
            self.secondaryLog(error.error_msg);
            self.secondaryLog(util.inspect(error));
          }

        } else {
          //self.secondaryLog('Получение расширенной информации участников группы <strong>' + members_group_response.group_id + '</strong> прошло успешно');

          window.console.log(response);

          global.success_added += 1;

          self.renderSidebar();

          db_users.insert({_id: user.uid}, function(err, objects){
            if (err) self.secondaryLog(err.message);

            self.secondaryLog('Добавлен новый пользователь в базу данных.');
          });

          setTimeout(function(){
            if(users.length > count + 1){
              self.addToFriends(users, count);
            } else {
              emitter.emit('get_group_members_again');
            }

          }, 5000);
        }
      }
    );
  } else {
    emitter.emit('get_group_members_again');
  }
}

_class.prototype.connectToDb = function(callback){
  this.primaryLog('Подключаемся к базе данных');

  MongoClient.connect('mongodb://127.0.0.1:27017/spammerdb', function(err, db) {
    if(err) throw err;

    callback(db);
  });
}


module.exports = _class;