const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://localhost:27017';
const dbName = 'np_db';
var db;
var ObjectId = require('mongodb').ObjectID;

var moment = require('moment');
require('moment-timezone');
moment.tz.setDefault("Asia/Seoul");


MongoClient.connect(url, {useNewUrlParser: true} , function(err, client) {
    console.log("Connected successfully to server");

    db = client.db(dbName);
});

exports.showpost = function(id, callback) {
    console.log('showpost 호출됨');

    var users = db.collection('users');
    var user = users.find({ 'id': id });
    var name;

    user.toArray(function(err, docs) {
        if(err) {
            console.log('err:' + err);
        } 
        if(docs.length > 0) {
            name = docs[0].name;
        } else {
            console.log('로그인이 안되어있음');
        }
    });

    var mysort = { _id: -1 };

    var post = db.collection('post');
    var posts = post.find({}).sort(mysort);
    
    posts.toArray(function(err, docs) {
        if (err) {
            console.log('err:' + err);
            callback(err, null);
        } else {
            console.log('게시물 찾음');
            callback(null, docs, name);
        }
    });
}

exports.addUser = function (id, passwords, name, callback) {
    console.log('add User 호출됨' + id + '  , ' + passwords);
    var users = db.collection('users');
 
    users.insertMany([{ "id": id, "passwords": passwords, "name": name }],
        function (err, result) {
            if (err) {
                console.log('err: ' + err);
                callback(err, null);
            } else {
                console.log('사용자 추가 됨');
                callback(null, result);
            }
        }
    );
};

exports.authUser = function (id, password, callback) {
    console.log('authUser 호출됨');

    var users = db.collection('users');
    var user = users.find({ 'id': id, 'passwords': password });

    user.toArray(function (err, docs) {
        if (err) {
            console.log('err:' + err);
            callback(err, null);
        } else {
            console.log('유저를 찾음');
            callback(null, docs);
        }
    });
};

exports.addpost = function(content, id, callback) {
    console.log('addpost 호출됨');

    var post = db.collection("post");
    var users = db.collection('users');
    var user = users.find({ 'id': id });
    var date = moment().format('YYYY-MM-DD(hh:mm)');
    var like = 0;

    user.toArray(function(err, docs) {
        post.insertMany([{"name": docs[0].name, "id": id, "content": content, "date": date, 'like': like, 'like_user': []}], 
            function(err, result) {
                if (err) {
                    console.log('게시물 추가 안됨');
                    callback(err, null);
                } else {
                    console.log('게시물 추가 됨');
                    callback(null, result);
                }
            }
        );
    });
};

exports.addcomment = function(content, id, post_id, callback) {
    console.log('addcomment 호출됨');

    post_id = new ObjectId(post_id);
    var posts = db.collection("post");
    var post = posts.find({"_id": post_id});
    var users = db.collection('users');
    var user = users.find({ 'id': id });
    var date = moment().format('YYYY-MM-DD(hh:mm)');

    user.toArray(function(err, docs) {
        var comment = {'name': docs[0].name, 'content': content, 'date': date}
        posts.updateOne({"_id": post_id}, {$push: {'comments': comment}},
            function(err, result) {
                if (err) {
                    console.log('댓글 추가 안됨');
                    callback(err, null);
                } else {
                    console.log('댓글 추가 됨');
                    post.toArray(function(err, docs) {
                        callback(null, result, docs);
                    });
                }
            }
        );
    });
};

exports.addlike = function(post_id, id, callback) {
    console.log('addlike 호출됨');

    post_id = new ObjectId(post_id);
    console.log('post_id: ' + post_id);

    var posts = db.collection("post");
    var post = posts.find({'_id': post_id});

    post.toArray(function(err, docs) {
        posts.updateOne({"_id": post_id}, {$set: {'like': docs[0].like + 1}},
            function(err, result) {
                if(err) {
                    console.log('좋아요 증가 실패');
                    callback(err, null);
                } else {
                    console.log('좋아요 증가 성공');
                    posts.updateOne({"_id": post_id}, {$push: {'like_user': id}},
                        function(err, result) {
                            if(err) {
                                console.log('좋아요 유저 추가 실패');
                            } else {
                                console.log('좋아요 유저 추가 성공');
                            }
                        }
                    );
                    post.toArray(function(err, docs) {
                        callback(null, result, docs);
                    });
                }
            }
        );
    });
};

exports.sublike = function(post_id, id, callback) {
    console.log('sublike 호출됨');

    post_id = new ObjectId(post_id);
    console.log('post_id: ' + post_id);

    var posts = db.collection("post");
    var post = posts.find({'_id': post_id});

    post.toArray(function(err, docs) {
        posts.updateOne({"_id": post_id}, {$set: {'like': docs[0].like - 1}},
            function(err, result) {
                if(err) {
                    console.log('좋아요 감소 실패');
                    callback(err, null);
                } else {
                    console.log('좋아요 감소 성공');
                    posts.deleteOne({'like_user': id},
                        function(err, result) {
                            if(err) {
                                console.log('좋아요 유저 삭제 실패');
                            } else {
                                console.log('좋아요 유저 삭제 성공');
                            }
                        }
                    );
                    post.toArray(function(err, docs) {
                        console.log(docs);
                        callback(null, result, docs);
                    });
                }
            }
        );
    });
};

exports.showprofile = function(id, callback) {
    console.log('showprofile 호출됨');

    var users = db.collection('users');
    var user = users.find({ 'id': id });
    var posts = db.collection('post');
    var post = posts.find({ 'id': id });

    user.toArray(function (err, user_docs) {
        if(err) {
            console.log('err:' + err);
            callback(err, null);
        } else {
            post.toArray(function(err, post_docs) {
                if(err) {
                    console.log('개인 게시물 찾기 실패');
                } else {
                    console.log('프로필 탐색 완료');
                    callback(null, user_docs, post_docs);
                }
            })
        }
    });
};