var Class = new Object();
var selected = 0;
var myname = 'ErrorUser';
var dboption = "order by checkedby desc, -endtime asc";
var showcheck = 0;
function print(a) {
    console.log(a);
}

function Class_Add() {
    var name = document.getElementById('Name').value;
    var explain = document.getElementById('explain').value;
    var filedata = document.getElementById('imagepath');
    var imagedata = filedata.files[0];

    var http = new XMLHttpRequest();
    var formData = new FormData();
    formData.append('Name', name);
    formData.append('explain', explain);
    formData.append('imagepath', imagedata);
    http.onreadystatechange = function () {
        if (http.readyState == 4 && http.status == 200) {
            var result = JSON.parse(http.responseText);
            if (result.success) {
                alert('생성 성공');
                window.location.href = '/';
            }
            else {
                alert('생성 실패' + result.ErrorMessage);
            }
        }
    }
    http.open('POST', '/newroom', true);
    //   http.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    http.send(formData);
}
function getAuthId() {
    var http = new XMLHttpRequest();
    http.onreadystatechange = function () {
        if (http.readyState == 4 && http.status == 200) {
            var result = JSON.parse(http.responseText);
            //console.log(result);
        }
    }
    http.open('POST', '/getauthid', true);
    http.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    http.send();
}
function Get_Class() {
    var http = new XMLHttpRequest();
    http.onreadystatechange = function () {

        if (http.readyState == 4 && http.status == 200) {
            document.getElementById('loadingbar').style.display = 'none';
            document.getElementById('STBox').style.backgroundImage = 'url(image/NewStart.png)'

            // background - image: url(image / start.png);
            var result = JSON.parse(http.responseText);

            for (var i = 0; i < result.count; i++) {
                Class[result.Class[i].ownnum] = result.Class[i];
                var arrays = ` 
                <style> #class${result.Class[i].ownnum}:after {
content: "";
position: absolute;
top:0;
left:0;
width: 100%;
height: 100%;
background-image:url('backImage/${result.Class[i].imagepath}');
background-size:cover;
opacity: 0.5;
z-index:-1;
</style>

                <div class="boxes" id="class${result.Class[i].ownnum}"style=" position:relative; ">
               
                <img class=" plus" onclick='showplus(${i})' align="right" src="image/plus.png" width="30" weight="15" />
                <div id="extra${i}" class="extraes" hidden="hidden">
                    <p class="pluscontent">
                        <a id="delete" onclick="deleteRoom(${result.Class[i].ownnum});">삭제하기</a>
                        <br />

                        <a onclick="ChangeCName(${result.Class[i].ownnum});" id="changename">이름변경</a><!--이름 변경-->
                        <br />

                        <a onclick="InviteFriend(${result.Class[i].ownnum});" id="invite">친구초대</a>
                        <br />
                    
                        <a onclick="classOut(${result.Class[i].ownnum});" id="classout">나가기&nbsp;</a>
                        <br />
                    </p>    
                    
                </div>
                <br />
                
                <br />
                <a href="#" class="Btns" id="${result.Class[i].ownnum}" onclick="showClass(this)">${result.Class[i].Name}</a>
               
                
            </div>
`;
                //console.log(arrays);

                document.getElementById('subBox1').innerHTML += arrays;
            }

        }
    }
    http.open('POST', '/getrooms', true);
    http.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    http.send();

}

function getMyData() {
    var http = new XMLHttpRequest();
    http.onreadystatechange = function () {
        if (http.readyState == 4 && http.status == 200) {
            var result = JSON.parse(http.responseText);
            //console.log(result);
            return result;

        }

    }
    http.open('POST', '/getMyData', false);
    http.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    http.send();

}
function setMyName() {
    var http = new XMLHttpRequest();
    http.onreadystatechange = function () {
        if (http.readyState == 4 && http.status == 200) {
            var result = JSON.parse(http.responseText);
            document.getElementById('myname').innerText = result.DisplayName + '님   ' + result.authId;
            myname = result.DisplayName;
            socket.emit("login", {
                authId: result.authId
            });

        }
    }
    http.open('POST', '/getMyData', true);
    http.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    http.send();

}
function getClass(ownnum) {
    var http = new XMLHttpRequest();
    http.onreadystatechange = function () {
        if (http.readyState == 4 && http.status == 200) {
            var results = JSON.parse(http.responseText);
            //console.log(results);
            document.getElementById("ClassTitle").innerText = results.Name;
            document.getElementById("ClassExplain").innerText = results.exp;
            document.getElementById("Title").style.backgroundImage = `url(backImage/${results.imagepath})`;

            //  //console.log(document.getElementById("ClassTitle").style.backgroundImage);
        }
    }
    http.open('POST', '/getroom', true);
    selected = ownnum;
    http.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    http.send('ownnum=' + ownnum);
}
function setClass(ownnum) {
    document.getElementById("ClassTitle").innerText = Class[ownnum].Name;
    document.getElementById("ClassExplain").innerText = Class[ownnum].exp;
    document.getElementById("Title").style.backgroundImage = `url(backImage/${Class[ownnum].imagepath})`;
    document.getElementById('parah').innerHTML = "";

}
function getName(ownnum) {
    var http = new XMLHttpRequest();
    http.onreadystatechange = function () {
        if (http.readyState == 4 && http.status == 200) {
            var results = JSON.parse(http.responseText);
            alert(`이름 : ${results.Userdata.displayName}
초대 ID : ${results.Userdata.authId}
프로젝트 참가 시간 : ${results.Userdata.entertime}`);
        }
    }
    http.open('POST', '/getName', true);

    http.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    http.send('ownnum=' + ownnum + '&project=' + selected);
}

function deleteRoom(num) {
    var http = new XMLHttpRequest();
    http.onreadystatechange = function () {
        if (http.readyState == 4 && http.status == 200) {
            var results = JSON.parse(http.responseText);
            if (results.success) {
                alert('삭제가 완료되었습니다.');
                window.location.href = "/";
            }
            else {
                alert('삭제 실패. ' + results.ErrorMessage);
            }
        }
    }
    http.open('POST', '/deleteRoom', true);

    http.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    http.send('ownnum=' + num);
}

function InviteFriend(num) {
    var authId = prompt('친구의 인증 ID를 입력해 주세요 (이름 옆에 위치) 예)local:asd123', '위치:아이디');

    if (authId) {
        var http = new XMLHttpRequest();
        http.onreadystatechange = function () {
            if (http.readyState == 4 && http.status == 200) {
                var results = JSON.parse(http.responseText);
                if (results.success) {
                    getUsers(num);
                    alert('초대 성공.');
                }
                else {
                    alert('초대 실패. ' + results.ErrorMessage);
                }
            }
        }
        http.open('POST', '/inviteroom', true);
        http.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        http.send('ownnum=' + num + '&friendAuthId=' + authId);
    }

}
function ChangeCName(num) {

    var newName = prompt('새로운 이름을 설정해 주세요', '');

    if (newName) {
        var http = new XMLHttpRequest();
        http.onreadystatechange = function () {
            if (http.readyState == 4 && http.status == 200) {
                var results = JSON.parse(http.responseText);
                if (results.success) {
                    alert('바꾸기 성공.');
                    window.location.href = '/';
                }
                else {
                    alert('바꾸기 실패. ' + results.ErrorMessage);
                }
            }
        }
        http.open('POST', '/changeCName', true);

        http.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        http.send('ownnum=' + num + '&newname=' + newName);
    }
}

function getTopics(id) {
    var http = new XMLHttpRequest();
    http.onreadystatechange = function () {
        if (http.readyState == 4 && http.status == 200) {
            var results = JSON.parse(http.responseText);
            if (results.success) {
                document.getElementById('parah').innerHTML = "";

                console.log(results.Topics);
                for (var i = 0; i < results.count; i++) {
                    document.getElementById('parah').innerHTML = createInput(results.Topics[i]) + document.getElementById('parah').innerHTML; // 생성하는 함수
                    //   console.log("add " + i);
                }
            }
            else {
                alert('주제 불러오기 오류 : ' + results.ErrorMessage);
            }
        }
    }
    http.open('POST', '/getTopics', true);
    http.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    http.send('ownnum=' + id + '&option=' + dboption + '&showcheck=' + showcheck);
}
function getUsers() {
    var http = new XMLHttpRequest();
    http.onreadystatechange = function () {
        if (http.readyState == 4 && http.status == 200) {
            var results = JSON.parse(http.responseText);
            if (results.success) {
                console.log(results);
                document.getElementById('mySidenav').innerHTML = `<a href="javascript:void(0)" class="closebtn" onclick="closeNav()">&times;</a>`;

                for (var i = 0; i < results.Users.length; i++)
                    document.getElementById('mySidenav').innerHTML += `<a href="#" onclick="getName(${results.Users[i].id});">${results.Users[i].displayName} ${results.Users[i].status == 0 ? "<font color='red'>●</font>" : "<font color='green'>●</font>"}</a>`;
            }
            else {
                alert("유저를 받아오는데 실패하였습니다." + results.ErrorMessage);
            }
        }
    }

    http.open('POST', '/getprojectUser', true);
    http.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    if (arguments.length == 0)
        http.send('ownnum=' + selected);
    else {
        http.send('ownnum=' + arguments[0]);
    }
}

function upTopic() {

    var locate = "";
    if (navigator.platform) {
        if (0 > "win16|win32|win64|mac".indexOf(navigator.platform.toLowerCase())) {
            locate = "mobile";

        } else {
            locate = "web";
        }
    }
    var http = new XMLHttpRequest();
    //var formdata = new FormData();
    var Topic = document.getElementById("input").value; // 글
    if (Topic.length < 4) {
        alert("해야할 일은 4글자 이상으로 입력해 주세요.");
        return 0;
    }
    var endtime = "unset";
    if (DTshow == 1) {
        if (document.getElementById('now_date').value == "") {
            alert('시간을 제대로 적지 않았습니다.');
            return;
        }
        else {
            endtime = document.getElementById('now_date').value;
            if (new Date(endtime).getTime() < new Date()) {
                alert('현재시간보다 이후로 해주세요.');
                return;
            }
        }
    }
    document.getElementById("input").value = "";

    http.onreadystatechange = function () {
        if (http.readyState == 4 && http.status == 200) {
            var result = JSON.parse(http.responseText);
            if (result.success) {
                document.getElementById('checks').checked = false;
                DTshow = false;
                document.getElementById("inputerDT").hidden = "hidden";
                socket.emit('changetopic', selected);
                getTopics(selected);

            }
            else {
                alert('올리기 실패 ' + result.ErrorMessage);
            }
        }
    }                                                            
    http.open('POST', '/upTopic', true);
    http.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    http.send(`ownnum=${selected}&endtime=${endtime}&locate=${locate}&Topic=${Topic}`);
}

function checkTopic(id) {
   
    var http = new XMLHttpRequest();
   
    if (document.getElementById('checkbox' + id).getAttribute('checked') === null) {
        http.onreadystatechange = function () {
            if (http.readyState == 4 && http.status == 200) {
                var result = JSON.parse(http.responseText);
                if (result.success) {

                    socket.emit('changetopic', selected);
                    getTopics(selected);
                 //   alert('완료 표시 성공');
                }
                else {
                    alert('완료 표시 실패 - ' + result.ErrorMessage);
                }
            }
        }
        http.open('POST', '/checkTopic', true);
    }
    else {
        if (confirm('완료한 항목입니다. 미완료로 하시겠습니까?')) {
            http.onreadystatechange = function () {
                if (http.readyState == 4 && http.status == 200) {
                    var result = JSON.parse(http.responseText);
                    if (result.success) {

                        socket.emit('changetopic', selected);
                        getTopics(selected);
                   //     alert('미완료 표시 성공');
                    }
                    else {
                        alert('미완료 표시 실패 - ' + result.ErrorMessage);
                    }
                }
            }
            http.open('POST', '/uncheckTopic', true);
        }
        else {
            document.getElementById('checkbox' + id).checked = true;
            return;
        }
    }
   
    http.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    http.send('topicnum=' + id);
}

function classOut(id) {
    var http = new XMLHttpRequest();

    http.onreadystatechange = function () {
        if (http.readyState == 4 && http.status == 200) {
            var results = JSON.parse(http.responseText);
            if (results.success) {
                window.location.href = '/';
            }
            else {
                alert('나가기 오류 : ' + results.ErrorMessage);
            }
        }
    }
    http.open('POST', '/classout', true);
    http.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    http.send(`ownnum=${id}`);
}

function getChatting() {
    if (selected == 0)
        return;
    var http = new XMLHttpRequest();

    http.onreadystatechange = function () {
        if (http.readyState == 4 && http.status == 200) {
            var results = JSON.parse(http.responseText);
            if (results.success) {
                console.log(results.chatdata);
            }
            else {
                alert('채팅을 불러오는데 실패하였습니다. ' + results.ErrorMessage);
            }
        }
    }
    http.open('POST', '/getchat', true);
    http.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    http.send(`ownnum=${selected}`);
}