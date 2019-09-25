import "UserLogin"
var Todo_List = { id: 0, ischeck: 0, UserName: "서상희", Contents: "안녕하세요", time: "2017/10/28 10:20" };
var Todo_Array = new Array();
Todo_Array[0] = Todo_List;
function leadingZeros(n, digits) {
    var zero = '';
    n = n.toString();

    if (n.length < digits) {
        for (i = 0; i < digits - n.length; i++)
            zero += '0';
    }
    return zero + n;
}

function getTimeStamp() {
    var d = new Date();
    var s =
        leadingZeros(d.getFullYear(), 4) + '/' +
        leadingZeros(d.getMonth() + 1, 2) + '/' +
        leadingZeros(d.getDate(), 2) + ' ' +

        leadingZeros(d.getHours(), 2) + ':' +
        leadingZeros(d.getMinutes(), 2) + ':' +
        leadingZeros(d.getSeconds(), 2);

    return s;
}
function ToDo_Search(id, name) {
    if (arguments.length == 1) {
        for (var i = 0; i < Todo_Array.length; i++) {
            if (Todo_Array[i].id == id) {
                return i;
            }
        }
        return -1;
    }
    else {
        for (var i = 0; i < Todo_Array.length; i++) {
            if (Todo_Array[i].id == id) {
                if (Todo_Array[i].UserName === name) {
                    return i;
                }
                else
                    return -2;
            }
        }
    }
}
function ToDo_Insert() {
    if (myuser == 0) {
        alert("유저 인증 실패");
    }
    else {
        var user_name = myuser.Name;
        var Contents = document.getElementById("Topic_Insert").value;
        var Now_Time = getTimeStamp();
        var New_Todo = { id: Todo_Array.length, ischeck: 0, UserName: user_name, Contents: Contents, time: Now_Time };
        Todo_Array.push(New_Todo);
        alert("ToDo 추가 완료");

    }
}
function ToDo_Delete(id) {
    var i = ToDo_Search(id, name);
    if (i == -1) {
        alert("해당 인덱스를 찾을 수 없습니다");
    }
    else if (i == -2) {
        alert("권한이 없습니다.")
    }
    else {
        Todo_Array.splice(i, 1);
        alert("삭제 성공");
    }
}
function ToDo_Check(id) {
    var i = ToDo_Search(id, name);
    if (i == -1) {
        alert("해당 인덱스를 찾을 수 없습니다.");
    }
    else if(i == -2)
    {
        alert("권한이 없습니다.");
    }
    else{
        if (Todo_Array[i].ischeck == 0)
            Todo_Array[i].ischeck = 1;
        else
            Todo_Array[i].ischeck = 0;
    }
}