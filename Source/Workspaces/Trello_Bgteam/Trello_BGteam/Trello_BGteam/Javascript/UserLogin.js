var users = {
    Name: 'test', ID: 'hello', password: 'world', Email: 'hello@dgsw.hs.kr'
};
function post(path, params, method) {
    method = method || "post"; // Set method to post by default if not specified.

    // The rest of this code assumes you are not using a library.
    // It can be made less wordy if you use one.
    var form = document.createElement("form");
    form.setAttribute("method", method);
    form.setAttribute("action", path);

    for (var key in params) {
        if (params.hasOwnProperty(key)) {
            var hiddenField = document.createElement("input");
            hiddenField.setAttribute("type", "hidden");
            hiddenField.setAttribute("name", key);
            hiddenField.setAttribute("value", params[key]);

            form.appendChild(hiddenField);
        }
    }

    document.body.appendChild(form);
    form.submit();
}
var UserArray = new Array();
UserArray[0] = users;
var myuser = 0;
function Login() {
    var ID = document.getElementById('username').value;
    var password = document.getElementById('password').value;

    var http = new XMLHttpRequest();


    http.onreadystatechange = function () {
     
        if (http.readyState == 4 && http.status == 200) {
            var result = JSON.parse(http.responseText);
            if (result.success === true) {
                alert(result.DisplayName + "님 환영합니다.");
         //       post("/", result);
                window.location.replace('/');
            }
            else {
                alert('해당 이메일은 존재하지 않습니다.');
            }
        }
    }
    http.open('POST', '/login', true);

    http.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    http.send('userid=' + ID + '&password=' + password);
}
function SignUp() {
    var id_put = document.getElementById('userid').value;
    var password_put = document.getElementById('password').value;
    var Email_put = document.getElementById('email').value;
    var name_put = document.getElementById('user_name').value;
    if (id_put.length < 4) {
        alert('아이디는 최소 4글자로 해주시길 바랍니다.');
        return;
    } if (password_put.length < 4) {
        alert('비밀번호는 최소 4글자로 해주시길 바랍니다.');
        return;
    }
    if (name_put.length == 0) {
        alert('이름은 공백으로 둘 수 없습니다.');
        return;
    }
    var http = new XMLHttpRequest();


    http.onreadystatechange = function () {

        if (http.readyState == 4 && http.status == 200) {

            var result = JSON.parse(http.responseText);
            if (result.success === true) {
                alert("회원가입 성공");
                window.location.href = '/';
            }
            else {
                alert('회원가입 실패 Error : ' + result.ErrorMessage);
            }
        }
    }
    http.open('POST', '/register', true);

    http.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    http.send('userid=' + id_put + '&password=' + password_put + '&DisplayName=' + name_put + '&email=' + Email_put);
}

function Change_Name() {
    var index = Login();
    if (index != -1) {
        UserArray[index].Name = document.getElementById('user_name').value;
        alert("이름을 성공적으로 바꾸었습니다.");
    }
    else {
        alert("바꾸기 실패");
    }

}
function Find_ID() {
    var user_email = document.getElementById('user_email').value;
    var http = new XMLHttpRequest();
    http.onreadystatechange = function () {
        if (http.readyState == 4 && http.status == 200) {
            var result = JSON.parse(http.responseText);
            if (result.success === true) {
                document.getElementById('ID_result').innerText = result.id;
            }
            else {
                alert('해당 이메일은 존재하지 않습니다.');
            }
        }
    }
    http.open('POST', '/findid', true);

    http.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    http.send('email=' + user_email);
}
function Find_Pass() {
    var user_email = document.getElementById('user_email').value;
    for (var i = 0; i < UserArray.length; i++) {
        if (UserArray[i].Email === user_email) {

            document.getElementById("PW_result").textContent = UserArray[i].password;
            alert("비밀번호를 찾았습니다.");
            return;

        }
    }
    alert("해당 이메일이 없습니다.");
    return 0;

}