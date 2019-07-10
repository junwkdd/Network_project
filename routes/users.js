var express = require('express');
var router = express.Router();

var model = require('../model/DAO');

router.route('/')
.get(function(req, res, next) {
  var id = req.query.id;

  model.showprofile(id, 
    function(err, result_user, result_post) {
      if(err) {
        res.render('error', {err: err});
      }
      if(result_user && result_post) {
        res.render('profile', {user: result_user[0], post: result_post});
      } else {
        res.render('error', {err: '프로필 불러오기 실패'});
      }
    }
  );
});

router.route('/register')
.get(function(req, res, next) {
  res.render('register');
})
.post(function(req, res, next) {
  console.log('register post 방식으로 호출됨');

  var id = req.body.id;
  var pw = req.body.pw;
  var repw = req.body.repw;
  var name = req.body.name;

  if(id && pw && repw && name) {
    if(pw && repw) {
      model.addUser(id, pw, name, 
        function(err, result) {
          if(err) {
            res.render('error', {err: err});
          }
          if(result) {
            res.redirect('/users/login');
          } else {
            res.render('error', {err: '회원가입 실패'});
          }
        }
      );
    }
  }
});

router.route('/login')
.get(function(req, res, next) {
  res.render('login');
})
.post(function(req, res, next) {
  var id = req.body.id;
  var pw = req.body.pw;

  if(id && pw) {
    model.authUser(id, pw, 
      function(err, result) {
        if(err) {
          res.render('error', {'err': err});
        }
        if(result) {
          res.cookie('id' , id);
          res.redirect('../');
        } else {
          res.render('error', {err: '로그인 실패'});
        }
      }
    );
  }
});

router.route('/logout')
.get(function(req, res, next) {
  res.clearCookie('id');
  res.redirect('/');
});

module.exports = router;
