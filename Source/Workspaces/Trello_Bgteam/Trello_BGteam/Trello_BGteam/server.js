//여러 추가 라이브러리를 require해줌
var express = require('express');
var session = require('express-session');
var MySQLStore = require('express-mysql-session');
var bodyParser = require('body-parser');
var bkfd2Password = require('pbkdf2-password');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var NaverStrategy = require('passport-naver').Strategy;
var GoogleStrategy = require('passport-google-oauth2').Strategy;
var KakaoStrategy = require('passport-kakao').Strategy;
var multer = require('multer');
var path = require('path');
var hasher = bkfd2Password();
var mysql = require('mysql');
var fs = require('fs');

const upload = multer({ dest: 'Html/backImage/' });
//Mysql 연결 정보를 저장하는 conn 생성
var conn = mysql.createConnection({
    host: "35.200.60.57",
    user: "trello_user",
    password: "trelloper",
    database: 'trello'
})
//MySQL 에 연결함
conn.connect();
//Express.js 를 사용하기 위해 app생성
var app = express();

//교실의 인원수를 정하는 코드
function setClassPeople(classnum) {
    conn.query(`update class set participants = (select Count(*) from enterclass where classid = ${classnum}) where ownnum = ${classnum}`);
}

//80번 포트로 서버를 연다.
var server = app.listen(80, function () {
    console.log("Go! Trello Main");
});

var io = require('socket.io')(server);


//html에 포함되는 파일들을 서버에 올려줌
app.use(express.static(__dirname));     //현재 디렉토리
app.use(express.static('Html'));        //Html폴더
app.use(express.static('Javascript'));  //Javascript 폴더
app.use(express.static('Html/image'));  //image폴더
app.use(bodyParser.urlencoded({ extended: false }));    //app.post방식을 사용하기 위해 생성
app.use(bodyParser.json());
/*
세션이란 사용자가 로그아웃하기 전에는 웹에 다시 들어와도 자동으로 로그인이 되는 것이다.
*/
app.use(session({ //MySQL 세션을 사용하기 위해 사용함
    secret: 'asdrer5613456^#%^$^%dsf1',
    resave: false,
    saveUninitialized: true,
    store: new MySQLStore({
        host: "35.200.60.57",
        user: "trello_user",
        password: "trelloper",
        database: 'trello'
    })
}));
//naver, facebook, kakao, google로 로그인을 만들기 위해서 passport를 사용함
app.use(passport.initialize());
//세션 로그인
app.use(passport.session());


//로컬 자동로그인 체크
passport.use(new LocalStrategy({
    usernameField: 'userid',
    passwordField: 'password'
},
    function (username, password, done) {
        var uname = username;
        var pwd = password;
        var sql = 'SELECT * FROM  users where authId=?';
        conn.query(sql, ['local:' + uname], function (err, results) {
            if (err) {
                console.log(err);

                return done('There is no user.');
            }
            var user = results[0];
            if (user == undefined) {
                console.log(err);
                return done('There is no user.');
            }
            return hasher({ password: pwd, salt: user.salt }, function (err, pass, salt, hash) {
                if (hash === user.password) {
                    done(null, user);
                } else {
                    done(null, false);
                }
            });
        });
    }));
//Passport기초 설정
passport.serializeUser(function (user, done) {
    done(null, user.authId);
})


//PassPort 설정
//~로그인 자동로그인 설정
passport.deserializeUser(function (id, done) {

    var sql = 'SELECT * FROM users where authId = ?';
    conn.query(sql, [id], function (err, results) {
        if (err) {
            console.log(err);
            done('There is no user.');
        } else {
            done(null, results[0]);
        }
    });
});


//각각의 서버와 통신하는 코드
//페이스북 서버와 통신하는 코드
passport.use(new FacebookStrategy({
    clientID: '125492684811558',
    clientSecret: 'edf58a5f0cfd2a87e4cc7c72f40619cb',
    callbackURL: "/auth/facebook/callback",
    profileFields: ['id', 'email', 'gender', 'link', 'locale', 'name', 'timezone', 'updated_time', 'verified', 'displayName']
},
    function (accessToken, refreshToken, profile, done) {
        //   console.log(profile);
        var authId = 'facebook:' + profile.id;
        var sql = 'SELECT * FROM users WHERE authId=?';
        conn.query(sql, [authId], function (err, results) {
            if (results.length > 0) {
                done(null, results[0]);
            } else {
                if (profile.emails == undefined) {
                    var newuser = {
                        'authId': authId,
                        'displayName': profile.displayName,

                        'email': ""
                    };
                }
                else {
                    var newuser = {
                        'authId': authId,
                        'displayName': profile.displayName,

                        'email': profile.emails[0].value
                    };
                }
                var sql = 'INSERT INTO users SET ?';
                conn.query(sql, newuser, function (err, results) {
                    if (err) {
                        console.log(err);
                        done('Error');
                    } else {
                        done(null, newuser);
                    }
                })
            }
        })

    }
))

//네이버 서버와 통신하는 코드
passport.use(new NaverStrategy({
    clientID: 'nP4w8HTDw_pJTIXzqzIO',
    clientSecret: 'pGsq7i8du5',
    callbackURL: '/auth/naver/callback'
}, function (accessToken, refreshToken, profile, done) {
    // console.log(profile);
    var authId = 'naver:' + profile.id;
    var sql = 'SELECT * FROM users WHERE authId=?';
    conn.query(sql, [authId], function (err, results) {
        if (results.length > 0) {
            done(null, results[0]);
        } else {
            if (profile.emails == undefined) {
                var newuser = {
                    'authId': authId,
                    'displayName': profile.displayName,

                    'email': ""
                };
            }
            else {
                var newuser = {
                    'authId': authId,
                    'displayName': profile.displayName,

                    'email': profile.emails[0].value
                };
            }
            var sql = 'INSERT INTO users SET ?';
            conn.query(sql, newuser, function (err, results) {
                if (err) {
                    console.log(err);
                    done('Error');
                } else {
                    done(null, newuser);
                }
            })
        }
    })

}
))

//구글 서버와 통신하는 코드
passport.use(new GoogleStrategy({
    clientID: '822420481056-tgqc4u4sutlocj6giq87cqb914b9se38.apps.googleusercontent.com',
    clientSecret: 'hOKW2yApZlpAE4YaY4Je_REi',
    callbackURL: '/auth/google/callback',
    passReqToCallback: true
}, function (request, accessToken, refreshToken, profile, done) {
    // console.log(profile);
    var authId = 'google:' + profile.id;
    var sql = 'SELECT * FROM users WHERE authId=?';
    conn.query(sql, [authId], function (err, results) {
        if (results.length > 0) {
            done(null, results[0]);
        } else {
            if (profile.emails == undefined) {
                var newuser = {
                    'authId': authId,
                    'displayName': profile.displayName,

                    'email': ""
                };
            }
            else {
                var newuser = {
                    'authId': authId,
                    'displayName': profile.displayName,

                    'email': profile.emails[0].value
                };
            }
            var sql = 'INSERT INTO users SET ?';
            conn.query(sql, newuser, function (err, results) {
                if (err) {
                    console.log(err);
                    done('Error');
                } else {
                    done(null, newuser);
                }
            })
        }
    })

}
))

//카카오 서버와 통신하는 코드
passport.use(new KakaoStrategy({
    clientID: '2dafddfd4a48d52c07d909291829caaf',
    clientSecret: '',
    callbackURL: '/auth/kakao/callback'
}, function (accessToken, refreshToken, profile, done) {
    // console.log(profile);
    var authId = 'kakao:' + profile.id;
    var sql = 'SELECT * FROM users WHERE authId=?';
    conn.query(sql, [authId], function (err, results) {
        if (results.length > 0) {
            done(null, results[0]);
        } else {
            if (profile.emails == undefined) {
                var newuser = {
                    'authId': authId,
                    'displayName': profile.displayName,

                    'email': ""
                };
            }
            else {
                var newuser = {
                    'authId': authId,
                    'displayName': profile.displayName,

                    'email': profile.emails[0].value
                };
            }
            var sql = 'INSERT INTO users SET ?';
            conn.query(sql, newuser, function (err, results) {
                if (err) {
                    console.log(err);
                    done('Error');
                } else {
                    done(null, newuser);
                }
            })
        }
    })

}
))


//웹 서버를 위한 get request

//session TestPage

app.get('/test', function (req, res) {
    if (req.user && req.user.displayName) {
        res.sendFile(__dirname + '/Html/Test.html');
    }
    else {
        res.redirect('/login');
    }
})
app.get('/personal', function (req, res) {
    res.sendFile(__dirname + '/Html/trellopersonal.html');
})
//메인 접속 페이지
app.get('/', function (req, res) {
    if (req.user && req.user.displayName) { //로그인 정보가 있으면 로그인 후 화면으로 보내줌
        res.sendFile(__dirname + '/Html/TrelloBG.html');
    } else {    //로그인 정보가 없으면 로그인 페이지로 보냄
        res.redirect('/login');
    }
});
//로그아웃하는 페이지, 로그인 정보를 삭제 후 login페이지로 리다이렉트함
app.get('/logout', function (req, res) {
    req.logout();
    req.session.save(function () {
        res.redirect('/');
    });
});

//id찾는 페이지
app.get('/findid', function (req, res) {
    res.sendFile(__dirname + "/Html/BGSearchID.html");
});

//passport 찾는 페이지
app.get('/findpass', function (req, res) {
    res.sendFile(__dirname + "/Html/BGSearchPW.html");
})

//새로운 방을 만드는 페이지를 보내줌
app.get('/newroom', function (req, res) {
    if (req.user && req.user.displayName) {
        res.sendFile(__dirname + '/Html/BGMain.html');
    } else {
        res.redirect('/login');
    }
});

//login 홈페이지로 들어갈때 로그인 페이지를 전송해줌
app.get('/login', function (req, res) {
    if (req.user && req.user.displayName) {
        res.redirect('/');
    } else {
        res.sendFile(__dirname + '/Html/BGMain.html');
    }

})

app.get('/addClass', function (req, res) {
    if (req.user && req.user.id) {
        res.sendFile(__dirname + '/Html/AddClass.html');
    }
    else {
        res.redirect('/');
    }
})

//페이스북으로 로그인
app.get('/auth/facebook', passport.authorize('facebook', { authType: 'rerequest', scope: ['email'] }));

//네이버로 로그인
app.get('/auth/naver', passport.authorize('naver'));

//구글로 로그인
app.get('/auth/google', passport.authorize('google', { scope: ['email', 'profile'] }));

//카카오톡으로 로그인
app.get('/auth/kakao', passport.authorize('kakao'));

//페이스북으로 로그인 콜백 (성공인지 실패인지)
app.get('/auth/facebook/callback',
    passport.authenticate('facebook', { failureRedirect: '/login' }),
    function (req, res) {
        // Successful authentication, redirect home.
        res.redirect('/');
    });

//네이버로 로그인 콜백
app.get('/auth/naver/callback',
    passport.authenticate('naver', { failureRedirect: '/login' }),
    function (req, res) {
        // Successful authentication, redirect home.
        res.redirect('/');
    });

//구글로 로그인 콜백
app.get('/auth/google/callback',
    passport.authenticate('google', { successRedirect: '/', failureRedirect: '/login', scope: ['email', 'profile'] }),
    function (req, res) {
        // Successful authentication, redirect home.
        res.redirect('/');
    });

//카카오톡으로 로그인 콜백
app.get('/auth/kakao/callback',
    passport.authenticate('kakao', { failureRedirect: '/login' }),
    function (req, res) {
        // Successful authentication, redirect home.
        res.redirect('/');
    });

//회원가입 html 페이지 
app.get('/register', function (req, res) {
    res.sendFile(__dirname + '/Html/BGJoin.html');
});



//카카오톡 api를 위한 처음 key를 누를 때
app.get('/kakaochat/keyboard', function (req, res) {
    const menu = {
        type: 'text'
    };
    res.set({
        'content-type': 'application/json'
    }).send(JSON.stringify(menu));
})



//카카오톡으로 부터 메시지가 올 때
app.post('/kakaochat/message', function (req, res) {

    var message = {
        message: {
            text: 'error'
        }
    };
    conn.query(`select id, displayName from users where id in (select user_id from kakaosession where user_key = "${req.body.user_key}")`, function (err, userdata) {

        if (err) {
            message.message.text = 'DB오류';
            res.set({
                'content-type': 'application/json'
            }).send(JSON.stringify(message)); return;
        }
        else if (userdata[0]) {
            if (req.body.content === '로그아웃') {
                conn.query(`delete from kakaosession where user_key = '${req.body.user_key}'`, function (err, results) {
                    if (err) {
                        message.message.text = '로그아웃 실패';
                    } else {
                        message.message.text = '성공적으로 로그아웃 되었습니다';
                    }
                    res.set({
                        'content-type': 'application/json'
                    }).send(JSON.stringify(message)); return;
                })
            }
            else if (req.body.content === "시간 문법" || req.body.content === "시간문법") {
                message.message.text = `1. ~년, ~월, ~일, ~시, ~분, ~초 를 선택적으로 사용합니다 (순서는 지켜야 함) 만약 문법에 어긋날 시 무시됩니다. 
빠진 년, 월, 일은 현재 시간으로 채워집니다.
예) 2018년 2월 4시까지 (2018년 2월 (오늘 날짜)일 4시 0분 0초)
18시 30분까지 (오늘 날짜 오후 6시 30분 0초)
2. '내일', '내일 모레' 문법도 가능합니다. (이 문법이 있을시 시간만 허용됨) 
예) 내일 4시까지 (O),
내일 모레 4일까지 (X),
내일까지 (O 내일 00시 00분으로 됨)
3. 오전, 오후문법도 가능합니다. (없을시 24시표기)
예)
14일 오후 6시까지 (O)
내일 오전 7시까지 (O)
내일 오후 14시까지 (O 다음날 오전 2시로 됨)`
                res.set({
                    'content-type': 'application/json'
                }).send(JSON.stringify(message)); return;
            }
            else if (req.body.content === "내 프로젝트" || req.body.content === "내프로젝트") {
                restapi = true;
                conn.query(`select Name, participants from trello.class where ownnum in (select classid from trello.enterclass where userid = ${userdata[0].id})`, function (err, results) {
                    if (err) {
                        message.message.text = '불러오기 실패 ' + err.message;
                    }
                    else if (results[0]) {
                        message.message.text = '가입된 프로젝트 (이름, 인원)\n';
                        for (var i = 0; i < results.length; i++) {
                            message.message.text += results[i].Name + ", " + results[i].participants + '명\n';
                        }

                    } else {
                        message.message.text = '내 프로젝트가 없습니다. ';
                    }

                    res.set({
                        'content-type': 'application/json'
                    }).send(JSON.stringify(message)); return;
                });
            }
            else if (req.body.content === "?" || req.body.content === "help") {
                message.message.text = `1. '내 프로젝트' : 현재 내가 가입된 프로젝트를 봅니다.
2. '할 일 추가' : 할 일 추가 문법을 봅니다.
3. '로그아웃' : 카카오톡에서 BGTrello를 로그아웃합니다.`;
                res.set({
                    'content-type': 'application/json'
                }).send(JSON.stringify(message)); return;
            }
            else if (req.body.content === "할 일 추가 문법" || req.body.content === "할일추가문법") {
                message.message.text = "프로젝트 이름 : 자신이 가입된 프로젝트 이름입니다. 시간 : 만료 일자입니다. 없을 시 만료 일자가 없는 것으로 간주합니다. 자세한 사항은 '시간 문법'이라고 물어보세요 해야할 일 : ~라고 해줘 에서 ~부분만 올라갑니다.";
                res.set({
                    'content-type': 'application/json'
                }).send(JSON.stringify(message)); return;
            }
            else if (req.body.content === "할 일 추가" || req.body.content === "할일추가") {
                message.message.text = '형식 : [프로젝트 이름]에 [시간]까지 [해야할 일]라고 해줘 자세한 사항은 "할 일 추가 문법"이라고 물어보세요';
                res.set({
                    'content-type': 'application/json'
                }).send(JSON.stringify(message)); return;
            }
            else if (req.body.content.indexOf("에 ") != -1) {
                var restapi = false;
                var data = req.body.content;
                var location;
                var time;
                var Todo;
                message.message.text = '  형식 : [프로젝트 이름]에 [시간]까지 [해야할 일]라고 해줘 (시간은 없어도 가능) 자세한 사항은 "할 일 추가 문법"이라고 물어보세요';
                if (data.indexOf('에 ') != -1) {
                    location = data.split('에 ')[0];
                    if (data.indexOf('까지 ') != -1) {
                        time = data.split('에 ')[1].split('까지 ')[0];
                        if (data.indexOf('라고 해줘') != -1) {
                            Todo = data.split('에 ')[1].split('까지 ')[1].split('라고 해줘')[0];
                        }
                    }
                    else {
                        if (data.indexOf('라고 해줘') != -1) {
                            Todo = data.split('에 ')[1].split('라고 해줘')[0];
                        }
                    }

                }
                if (location == null) {
                    message.message.text = '프로젝트 이름이 없습니다.' + message.message.text;
                } else if (Todo == null) {
                    message.message.text = '해야할 일이 없습니다.' + message.message.text;
                } else if (time == null) {
                    if (Todo.length < 4) {
                        message.message.text = '"' + Todo + '"' + ' 최소 4글자 이상으로 해주세요.';
                        res.set({
                            'content-type': 'application/json'
                        }).send(JSON.stringify(message)); return;
                    }
                    else {
                        restapi = true;
                        conn.query(`select ownnum from trello.class where ownnum in (select classid from trello.enterclass where userid in (select user_id from kakaosession where user_key = '${req.body.user_key}')) and Name = '${location}';`, function (err, results) {
                            if (err) {
                                message.message.text = 'DB오류 ' + err.message;
                            } else if (results[0]) {
                                conn.query(`insert into topics (classnum, username, contents, endtime, locations) values (${results[0].ownnum}, '${userdata[0].displayName}','${Todo}', null, 'kakao')`, function (err, results2) {
                                    if (err) {
                                        message.message.text = 'DB에 넣는 중 오류가 발생하였습니다.' + err.message;
                                    }
                                    else {
                                        io.emit('topics', results[0].ownnum);
                                        message.message.text = '성공적으로 등록되었습니다.\n' + "프로젝트 : " + location + "\n제한 시간 : 없음" + "\n해야할 일 : " + Todo;
                                    }
                                    res.set({
                                        'content-type': 'application/json'
                                    }).send(JSON.stringify(message)); return;
                                });
                            } else {
                                message.message.text = '"' + location + '"' + ' 존재하지 않거나 가입되어 있지 않는 프로젝트입니다.';
                                res.set({
                                    'content-type': 'application/json'
                                }).send(JSON.stringify(message)); return;
                            }
                        });

                    }
                } else {
                    restapi = true;
                    conn.query(`select ownnum from trello.class where ownnum in (select classid from trello.enterclass where userid in (select user_id from kakaosession where user_key = '${req.body.user_key}')) and Name = '${location}';`, function (err, results) {
                        if (err) {
                            message.message.text = 'DB오류 ' + err.message;
                        }
                        else if (results[0]) {
                            //     console.log(results[0]);
                            var nowtime = new Date();
                            var koreantime = nowtime.getTime() + (nowtime.getTimezoneOffset() * 60000) + (9 * 3600000);
                            nowtime.setTime(koreantime);
                            var plustime = 0;
                            var timeerror = time;
                            nowtime.setHours(0);
                            nowtime.setMinutes(0);
                            nowtime.setSeconds(0);
                            time = time.replace(/ /g, "");
                            //   console.log(time);
                            var changecnt = 0;
                            if (time.indexOf("내일모래") != -1) {
                                changecnt++;
                                nowtime.setDate(nowtime.getDate() + 2);
                                time = time.split("내일모레")[1];
                            }
                            else if (time.indexOf("내일") != -1) {
                                changecnt++;
                                nowtime.setDate(nowtime.getDate() + 1);
                                time = time.split("내일")[1];
                            }

                            if (time.indexOf("년") != -1) {
                                changecnt++;
                                nowtime.setFullYear(time.split("년")[0].replace(/[^0-9]/, ''));
                                time = time.split("년")[1];
                            }
                            if (time.indexOf("월") != -1) {
                                changecnt++;
                                nowtime.setMonth(time.split("월")[0].replace(/[^0-9]/, ''));
                                nowtime.setMonth(nowtime.getMonth() - 1);
                                time = time.split("월")[1];
                            }
                            if (time.indexOf("일") != -1) {
                                changecnt++;
                                nowtime.setDate(time.split("일")[0].replace(/[^0-9]/, ''));
                                time = time.split("일")[1];
                            }
                            if (time.indexOf("오전") != -1) {
                                time = time.split("오전")[1];
                            }
                            if (time.indexOf("오후") != -1) {
                                plustime = 12;
                                time = time.split("오후")[1];
                            }
                            if (time.indexOf("시") != -1) {
                                changecnt++;
                                nowtime.setHours(time.split("시")[0].replace(/[^0-9]/, ''));
                                nowtime.setHours(nowtime.getHours() + plustime);
                                time = time.split("시")[1];
                            }
                            if (time.indexOf("분") != -1) {
                                changecnt++;
                                nowtime.setMinutes(time.split("분")[0].replace(/[^0-9]/, ''));
                                time = time.split("분")[1];
                            }
                            if (time.indexOf("초") != -1) {
                                changecnt++;
                                nowtime.setSeconds(time.split("초")[0].replace(/[^0-9]/, ''));
                                time = time.split("초")[1];
                            }
                            var dbtime = [nowtime.getFullYear(), nowtime.getMonth() + 1,
                            nowtime.getDate()
                            ].join('-') + ' ' +
                                [nowtime.getHours(),
                                nowtime.getMinutes(),
                                nowtime.getSeconds()].join(':');
                            //     console.log(dbtime);
                            if (new Date().getTime() > nowtime.getTime())
                            {
                                message.message.text = '"' + timeerror + '"' + ' 현재 시간보다 빠릅니다.';
                                res.set({
                                    'content-type': 'application/json'
                                }).send(JSON.stringify(message)); return;
                            }
                            else if (changecnt == 0) {
                                message.message.text = '"' + timeerror + '"' + ' 시간 형식이 잘못되었습니다.';
                                res.set({
                                    'content-type': 'application/json'
                                }).send(JSON.stringify(message)); return;
                            }
                            else {
                                if (Todo.length < 4) {
                                    message.message.text = '"' + Todo + '"' + ' 최소 4글자 이상으로 해주세요.';
                                    res.set({
                                        'content-type': 'application/json'
                                    }).send(JSON.stringify(message)); return;
                                }
                                else {
                                    conn.query(`insert into topics (classnum, username, contents, endtime, locations) values (${results[0].ownnum}, '${userdata[0].displayName}','${Todo}', '${dbtime}', 'kakao')`, function (err, results2) {
                                        if (err) {
                                            message.message.text = 'DB에 넣는 중 오류가 발생하였습니다.' + err.message;
                                        }
                                        else {

                                            io.emit('topics', results[0].ownnum);
                                            message.message.text = '성공적으로 등록되었습니다.\n' + "프로젝트 : " + location + "\n제한 시간 : " + dbtime + "\n해야할 일 : " + Todo;
                                        }
                                        res.set({
                                            'content-type': 'application/json'
                                        }).send(JSON.stringify(message)); return;
                                    });


                                }
                            }
                        }
                        else {
                            message.message.text = '"' + location + '"' + ' 존재하지 않거나 가입되어 있지 않는 프로젝트입니다.';
                            res.set({
                                'content-type': 'application/json'
                            }).send(JSON.stringify(message)); return;
                        }
                    });
                    // message.message.text = '프로젝트 이름 : ' + location + ' 시간 : ' + time + ' 해야할 일 : ' + Todo;
                }

                if (!restapi)
                    res.set({
                        'content-type': 'application/json'
                    }).send(JSON.stringify(message)); return;
            }
            else {
                message.message.text = '환영합니다! BGTrello카카오톡기능을 알려면 help또는 ?를 입력해주시길 바랍니다.';
                res.set({
                    'content-type': 'application/json'
                }).send(JSON.stringify(message)); return;
            }
        }
        else {
            if (req.body.type == 'text') {
                if (req.body.content.indexOf('로그인 ') !== -1) {
                    var data = req.body.content.split('로그인 ')[1].split('&');
                    if (data.length == 2) {
                        var uname = data[0];
                        var pwd = data[1];
                        var sql = 'SELECT * FROM  users where authId=?';
                        conn.query(sql, ['local:' + uname], function (err, results) {
                            if (err) {
                                console.log(err);
                                message.message.text = '로그인 실패';

                                res.set({
                                    'content-type': 'application/json'
                                }).send(JSON.stringify(message)); return;
                            }
                            else {
                                var user = results[0];
                                if (user == undefined) {
                                    console.log(err);
                                    message.message.text = '로그인 실패. 아이디가 틀렸습니다.';

                                    res.set({
                                        'content-type': 'application/json'
                                    }).send(JSON.stringify(message)); return;
                                } else {
                                    hasher({ password: pwd, salt: user.salt }, function (err, pass, salt, hash) {
                                        if (hash === user.password) {
                                            ///kakaouser[req.body.user_key] = user;
                                            conn.query(`insert into kakaosession (user_key, user_id) values ('${req.body.user_key}','${user.id}') `, function (err, results) {
                                                if (err) {
                                                    message.message.text = 'DB오류';
                                                }
                                                else {
                                                    message.message.text = '로그인 성공 할일을 말해주세요';
                                                }
                                                res.set({
                                                    'content-type': 'application/json'
                                                }).send(JSON.stringify(message)); return;
                                            })

                                        } else {
                                            message.message.text = '로그인 실패. 비밀번호가 틀렸습니다.';

                                            res.set({
                                                'content-type': 'application/json'
                                            }).send(JSON.stringify(message)); return;
                                        }
                                    });
                                }
                            }
                        });
                    } else {
                        message.message.text = '형식이 잘못되었습니다. 로그인 형식은 "로그인 [아이디]&[비밀번호]"로 입력해 주세요 (대괄호 제외)';

                        res.set({
                            'content-type': 'application/json'
                        }).send(JSON.stringify(message)); return;
                    }
                } else {
                    message = {
                        message: {
                            text: '로그인 후 이용하실 수 있습니다. 로그인 형식은 "로그인 [아이디]&[비밀번호]"로 입력해 주세요 (대괄호 제외) - dgswTrelloBG',
                            message_button: {
                                label: 'trelloBG사이트',
                                url: 'https://dgswtrello13.appspot.com/'
                            }
                        },

                    };
                    res.set({
                        'content-type': 'application/json'
                    }).send(JSON.stringify(message)); return;
                }
            } else {
                message = {
                    message: {
                        text: '로그인 후 이용하실 수 있습니다. 로그인 형식은 "로그인 [아이디]&[비밀번호]"로 입력해 주세요 (대괄호 제외) - dgswTrelloBG',
                        message_button: {
                            label: 'trelloBG사이트로 이동',
                            url: 'https://dgswtrello13.appspot.com/'
                        }
                    },

                };
                res.set({
                    'content-type': 'application/json'
                }).send(JSON.stringify(message)); return;
            }
        }
    })
})


/*
restapi 를 위한 post 방식 코드
frontend에서 xmlhttprequest를 해줘야 한다
*/

//아이디 찾기 버튼을 누를때 xmlrequest를 통해 데이터를 다시 전송해줌
app.post('/findid', function (req, res) {

    var email = req.body.email;
    var sql = 'SELECT username FROM users where email = ?';
    conn.query(sql, [email], function (err, results) {
        if (err) {
            return res.json({ success: false });
        } else {
            if (results[0] != null)
                return res.json({ success: true, id: results[0].username });
            else
                return res.json({ success: false });
        }
    })
});

//방 정보를 얻음
app.post('/getrooms', function (req, res) {
    var query = "select ownnum,exp, Name, imagepath, participants from trello.class where ownnum in (select classid from trello.enterclass where userid = " + req.user.id + ")";
    conn.query(query, function (err, results) {
        if (err) {
            return res.json({ success: false, ErrorMessage: err.message });
        }
        else res.json({ success: true, count: results.length, Class: results });

    });

});

//새로운 방 추가 html 전송
app.post('/newroom', upload.single('imagepath'), function (req, res) {
    var Name = req.body.Name;
    var explain = req.body.explain;
    // console.log(req.file);
    var querys = `select * from class where Name = '${Name}'`;
    conn.query(querys, function (err, results) {
        if (err) {
            return res.json({ success: false, ErrorMessage: err.message });
        }
        else if (results[0]) {
            return res.json({ success: false, ErrorMessage: "이미 같은 이름이 존재합니다." });
        }
        else {
            if (req.file) {
                fs.readFile(req.file.path, function (error, data) {
                    if (error) {
                        return res.json({ success: false, ErrorMessage: error.message });
                    }
                    var filePath = new Date().getTime() + path.extname(req.file.originalname);
                    //    console.log(filePath);
                    fs.writeFile(__dirname + '/Html/backImage/' + filePath, data, function (error) {
                        if (error) {
                            console.log(error);
                            return res.json({ success: false, ErrorMessage: error.message });
                        } else {
                            var query = "insert into class (Name, exp, imagepath, Participants, madeby) values ('" + Name + "', '" + explain + "', '" + filePath + "', 1,'" + req.user.id + "')";
                            conn.query(query, function (err, results) {
                                if (err) {
                                    return res.json({ success: false, ErrorMessage: err.message });
                                } else {
                                    conn.query(querys, function (err, results) {
                                        if (err) {
                                            return res.json({ success: false, ErrorMessage: err.message });
                                        }
                                        else if (results[0]) {
                                            query = `insert into enterclass (userid, classid) values ('${req.user.id}', '${results[0].ownnum}')`;
                                            conn.query(query, function (err, results) {
                                                if (err) {
                                                    return res.json({ success: false, ErrorMessage: err.message });
                                                }
                                                else {
                                                    return res.json({ success: true });
                                                }
                                            })
                                        }
                                        else {
                                            return res.json({ success: false, ErrorMessage: "생성이 안되었습니다." });
                                        }

                                    })

                                }
                            })
                        }

                    })
                })
            }
            else {
                var query = "insert into class (Name, exp, Participants, madeby) values ('" + Name + "', '" + explain + "', 1,'" + req.user.id + "')";
                conn.query(query, function (err, results) {
                    if (err) {
                        return res.json({ success: false, ErrorMessage: err.message });
                    } else {
                        conn.query(querys, function (err, results) {
                            if (err) {
                                return res.json({ success: false, ErrorMessage: err.message });
                            }
                            else if (results[0]) {
                                //     console.log(results[0]);
                                query = `insert into enterclass (userid, classid) values ('${req.user.id}', '${results[0].ownnum}')`;
                                conn.query(query, function (err, results) {
                                    if (err) {
                                        return res.json({ success: false, ErrorMessage: err.message });
                                    }
                                    else {
                                        return res.json({ success: true });
                                    }
                                })
                            }
                            else {
                                return res.json({ success: false, ErrorMessage: "생성이 안되었습니다." });
                            }

                        })

                    }
                })
            }
        }
    })


});

//방초대
app.post('/inviteroom', function (req, res) {
    var friendName = req.body.friendAuthId;
    var classnum = req.body.ownnum;
    if (friendName && classnum) {
        var query = `select id from users where authId = '${friendName}'`;
        conn.query(query, function (err, results) {
            if (err) {
                return res.json({ success: false, ErrorMessage: err.message });
            } else if (results[0]) {
                var id = results[0].id;
                query = `select userid from enterclass where userid = '${id}' and classid = '${classnum}'`;
                conn.query(query, function (err, results) {
                    if (err) {
                        return res.json({ success: false, ErrorMessage: err.message });
                    }
                    if (results[0])
                        return res.json({ success: false, ErrorMessage: "이미 가입되어 있습니다." });
                    else {
                        query = `insert into enterclass (userid, classid) values ('${id}', '${classnum}')`;
                        conn.query(query, function (err, results) {
                            if (err) {
                                return res.json({ success: false, ErrorMessage: err.message });
                            }
                            else {
                                setClassPeople(classnum);
                                return res.json({ success: true });
                            }
                        })
                    }
                })


            }
            else {
                return res.json({ success: false, ErrorMessage: '해당 인증 ID는 존재하지 않습니다.' });
            }
        })
    }
    else {
        return res.json({ success: false, ErrorMessage: '전달값이 충분히 전달되지 않았습니다' });
    }
})

//로그인 시도 post 아이디 비밀번호를 받음
app.post('/login', function (req, res) {
    passport.authenticate('local', function (err, user) {

        if (err) {
            return res.json({ success: false });
        }
        else if (user == false) {
            return res.json({ success: false });
        } else {
            req.login(user, function (err) {
                req.session.save(function () {
                    return res.json({ success: true, id: user.id, userid: user.username, email: user.email, DisplayName: user.displayName });
                });
            });
        }

    })(req, res);

})

//사용자 추가
app.post('/register', function (req, res) {
    //   console.log(req.body);
    hasher({ password: req.body.password }, function (err, pass, salt, hash) {
        var user = {
            authId: 'local:' + req.body.userid,
            email: req.body.email,
            username: req.body.userid,
            password: hash,
            salt: salt,
            displayName: req.body.DisplayName
        };
        var sql = 'INSERT INTO users SET ?';
        conn.query(sql, user, function (err, results) {
            if (err) {
                return res.json({ success: false, ErrorMessage: err.message });
            } else {
                return res.json({ success: true });
            }
        });
    });
});

//내 authId 받기
app.post('/getauthid', function (req, res) {
    if (req.user.id) {
        return res.json({ success: true, authId: req.user.authId });
    }
    else {
        return res.json({ success: false, ErrorMessage: '로그인 되지 않았습니다' });
    }
})

//한 방의 정보를 받기
app.post('/getroom', function (req, res) {
    if (req.body.ownnum == undefined) {
        return res.json({ success: false, ErrorMessage: 'ownnum이 전달되지 않았습니다.' });
    }
    var ownnum = req.body.ownnum;
    var query = `select * from class where ownnum = '${ownnum}'`;
    conn.query(query, function (err, results) {
        if (err) {
            return res.json({ success: false, ErrorMessage: err.message });
        }
        if (results[0]) {
            return res.json({ success: true, Name: results[0].Name, exp: results[0].exp, madeby: results[0].madeby, imagepath: results[0].imagepath });
        }
        else {
            return res.json({ success: false, ErrorMessage: '존재하지 않습니다.' });
        }
    })
})

//한 프로젝트 속 주제(글)을 올림
app.post('/upTopic', function (req, res) {
    var classnum = req.body.ownnum;
    var contents = req.body.Topic;
    var time = req.body.endtime;
    var locate = req.body.locate;
    if (classnum && contents && time) {

        var query = time != 'unset' ? `insert into topics (username, classnum, contents, locations, endtime) value ('${req.user.displayName}', '${classnum}', '${contents}', '${locate}', '${time}')`
            : `insert into topics (username, classnum, contents, locations, endtime) value ('${req.user.displayName}', '${classnum}', '${contents}', '${locate}', null)`;
        conn.query(query, function (err, results) {
            if (err) {
                return res.json({ success: false, ErrorMessage: err.message });
            }
            else {
                io.emit('topics', classnum);

                return res.json({ success: true });
            }
        })
    }
    else {
        return res.json({ success: false, ErrorMessage: '전달값이 충분히 전달되지 않았습니다. ownnum, Topic, endtime, location' });
    }
})

//한 프로젝트 속 주제들을 받아옴
app.post('/getTopics', function (req, res) {
    var classnum = req.body.ownnum;
    var option = req.body.option;
    var showcheck = req.body.showcheck;
    if (req.body.ownnum == undefined || !req.body.option || !req.body.showcheck) {
        return res.json({ success: false, ErrorMessage: '전달값이 충분히 전달되지 않았습니다. ownnum, option, showcheck' });
    }
    var query = `select topicnum,username, contents, endtime, uptime, checkedby, locations from topics where classnum = ${classnum} ${showcheck == 0 ? 'and checkedby = 0': ''} ${option};`;
    
    conn.query(query, function (err, results) {
        if (err) {
            return res.json({ success: false, ErrorMessage: err.message });
        }
        if (results[0]) {
            for (var i = 0; i < results.length; i++) {
                if (results[i].endtime != null)
                results[i].endtime = new Date(results[i].endtime).toLocaleString();
                results[i].uptime = new Date(results[i].uptime).toLocaleString();
            }
            return res.json({ success: true, count: results.length, Topics: results });
        }
        else {
            return res.json({ success: true, count: 0 });
        }
    })
})

//한 프로젝트 속 주제하나를 체크함 
app.post('/checkTopic', function (req, res) {
    if (req.body.topicnum == undefined) {
        return res.json({ success: false, ErrorMessage: '전달값이 충분히 전달되지 않았습니다. topicnum' });
    }
    if (!req.user.id) {
        return res.json({ success: false, ErrorMessage: '올바르지 않은 세션입니다.' });
    }

    var userid = req.user.id;
    var topicnum = req.body.topicnum;
    var query = `update topics set checkedby = ${userid} where topicnum = ${topicnum}`;
    conn.query(query, function (err, results) {
        if (err) {
            return res.json({ success: false, ErrorMessage: err.message });
        }
        else {
           
            return res.json({ success: true });
        }
    })
})

//한 프로젝트 속 주제하나를 체크 해제함
app.post('/uncheckTopic', function (req, res) {
    if (req.body.topicnum == undefined) {
        return res.json({ success: false, ErrorMessage: '전달값이 충분히 전달되지 않았습니다. topicnum' });
    }
    if (!req.user.id) {
        return res.json({ success: false, ErrorMessage: '올바르지 않은 세션입니다.' });
    }
    var userid = req.user.id;
    var topicnum = req.body.topicnum;
    var query = `update topics set checkedby = 0 where topicnum = ${topicnum}`;
    conn.query(query, function (err, results) {
        if (err) {
            return res.json({ success: false, ErrorMessage: err.message });
        }
        else {
            return res.json({ success: true });
        }
    })
})

//내 데이터를 받아옴
app.post('/getMyData', function (req, res) {
    if (req.user && req.user.id) {
        return res.json({ success: true, id: req.user.id, authId: req.user.authId, email: req.user.email, DisplayName: req.user.displayName });

    }
    else {
        return res.json({ success: false, ErrorMessage: '로그인 되지 않았습니다.' });

    }
})

//유저 고유번호를통해 사람이름을 알아옴
app.post('/getName', function (req, res) {
    if (req.body.ownnum == undefined) {
        return res.json({ success: false, ErrorMessage: '전달값이 충분히 전달되지 않았습니다' });
    }
    var query = `select authId, displayName from users where id = ${req.body.ownnum}`;
    conn.query(query, function (err, results) {
        if (err) {
            return res.json({ success: false, ErrorMessage: err.message });
        }
        if (results[0]) {
            return res.json({ success: true, Userdata : results[0] });
        }
        else {
            return res.json({ success: false, ErrorMessage: '해당 사람이 존재하지 않습니다.' });
        }
    })
})

//교실을 삭제함
app.post('/deleteroom', function (req, res) {
    if (req.user && req.user.id) {
        if (req.body.ownnum) {
            var query = `select madeby from class where ownnum = ${req.body.ownnum}`;
            conn.query(query, function (err, results) {
                if (err)
                    return res.json({ success: false, ErrorMessage: '해당 교실은 존재하지 않습니다.' });
                else if (results) {
                    if (results[0].madeby == req.user.id) {
                        query = `delete from class where ownnum = ${req.body.ownnum}`;
                        conn.query(query, function (err, results) {
                            if (err)
                                return res.json({ success: false, ErrorMessage: err.message });
                            else {
                                query = `delete from enterclass where classid = ${req.body.ownnum}`
                                conn.query(query, function (err, results) {
                                    if (err)
                                        return res.json({ success: false, ErrorMessage: err.message });
                                    else
                                        return res.json({ success: true });
                                })
                            }
                        })
                    }
                    else
                        return res.json({ success: false, ErrorMessage: '삭제할 권한이 없습니다' });
                }
            })
        }
        else
            return res.json({ success: false, ErrorMessage: '전달값이 충분히 전달되지 않았습니다. ownnum' });
    }
    else {
        return res.json({ success: false, ErrorMessage: '로그인 되지 않았습니다' });
    }
})

//한 프로젝트속 유저의 정보들을 받아옴
app.post('/getprojectUser', function (req, res) {

    if (req.body.ownnum == undefined) {
        return res.json({ success: false, ErrorMessage: "전달값이 충분히 전달되지 않았습니다. ownnum" });
    }
    else {
        conn.query(`select id, displayName, status from users where id in (select userid from enterclass where classid = ${req.body.ownnum})`, function (err, results) {
            if (err)
                return res.json({ success: false, ErrorMessage: '데이터베이스 오류 ' + err.message });
            else if (results[0]) {
                return res.json({ success: true, Users: results });
            }
            else {
                return res.json({ success: false, ErrorMessage: '프로젝트가 존재하지 않습니다.' });
            }
        });
    }
})

//교실 이름을 바꿈
app.post('/changeCName', function (req, res) {
    if (req.user && req.user.id) {
        if (req.body.ownnum && req.body.newname) {
            var query = `select madeby from class where ownnum = ${req.body.ownnum}`;
            conn.query(query, function (err, results) {
                if (err)
                    return res.json({ success: false, ErrorMessage: '해당 교실은 존재하지 않습니다.' });
                else if (results) {
                    if (results[0].madeby == req.user.id) {
                        query = `update class set name = '${req.body.newname}' where ownnum = ${req.body.ownnum}`;
                        conn.query(query, function (err, results) {
                            if (err)
                                return res.json({ success: false, ErrorMessage: err.message });
                            else {
                                return res.json({ success: true });
                            }
                        })
                    }
                    else
                        return res.json({ success: false, ErrorMessage: '이름을 바꿀 권한이 없습니다' });
                }
            })
        }
        else {
            return res.json({ success: false, ErrorMessage: '전달값이 충분히 전달되지 않았습니다. ownnum, newname' });
        }
    }
    else {
        return res.json({ success: false, ErrorMessage: '로그인 되지 않았습니다' });

    }
})

//잘못된 url에 접속시
app.all('*', function (req, res) {
    res.redirect('/');
})


//socket.io 설정
io.on('connection', function (socket) {
    socket.on('login', function (data) {
      
        socket.authId = data.authId;
        socket.join(socket.authId);
        console.log("login : " + socket.id);
        conn.query(`update users set status = 2 where authId = '${data.authId}'`, function (err, results) {
            if (err) {
                console.log(err);
            }
            else {
                socket.broadcast.emit('userdisconnect', socket.authId);

            }
        });

    });
    socket.on('changetopic', function (data) {

        io.emit('topics', data);
    })
    socket.on('forceDisconnect', function () {
        socket.disconnect();
    })
    socket.on('logout', function () {
        io.sockets.to(socket.authId).emit('forcelogout', '');
        socket.leaveAll();
    })
    socket.on('disconnect', function () {
        console.log('user disconnect: ', socket.authId);

        
        conn.query(`update users set status = 0 where authId = '${socket.authId}'`, function (err, results) {
            if (err) {
                console.log(err);
            }
            else {
                socket.broadcast.emit('userdisconnect', socket.authId);

            }
        });
    
    })
})