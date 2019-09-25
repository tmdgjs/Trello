// JavaScript source code
//Synthese
function winOpen(HtmlUrl) {
    myWin = window.open(HtmlUrl, "new", "width=750,height=975");
}

function adjust_textarea(h) {
    h.style.height = "20px";
    h.style.height = (h.scrollHeight) + "px";
}

function winClose() {
}

function goSection() {
    document.location.href = '#section';
}
function AfterAdd() {

    window.location.replace("TrelloBG.html");

}
var data = {

    checkedby: 0 ,
    contents: "게임할사람",
    endtime: "2017-12-20 05:00:00",
    locations: "kakao",
    topicnum: 11,
    uptime: "2017-12-20 04:00:00",
    username: "서상희"


}
function ifcheck() {
    if (checkInputValue === 'true') {
         arrInputValue.style.visibility = 'hidden';
         
    }
    else {
        console.log("checkVales =" + checkInputValue);
        console.log("arrInpUT = " + arrInputValue);
    }

}


var arrInput = new Array(0);  //할 일 갯수를 들고있는 배열
var arrInputValue = new Array(0);//할 일 텍스트 값을 가지고 있는 배열
var checkInputValue = new Array("");//할 일 체크 값을 가지고 있는 배열
var boxID = 0;
var checkID = 0;


function addInput() {
    arrInput.push(arrInput.length);
    arrInputValue.push("");
    checkInputValue.push("");
    console.log("arrInputlength=" + arrInput.length);
    display(); // 생성 내용을 conlose창에 띄어준다.
}

function display() {
    document.getElementById('parah').innerHTML = "";
    for (intI = 0; intI < arrInput.length; intI++) {


        document.getElementById('parah').innerHTML += createInput(data); // 생성하는 함수

    }
}

function saveValue(intId, strValue) {
    arrInputValue[intId] = strValue;
    boxID++;
    console.log("arrInputValue save=" + strValue + "ID=" + intId);
}
// 
function saveValue2(intld, checkValue) {
    if (typeof intId === 'undefined')
        intId = 0;
    console.log("checkInputValue save=" + checkValue + "ID=" + intld);
    checkInputValue[intId] = checkValue;
}

// 입력창을 하나 만들어 준다.
function createInput(newdata) {
    
    return "  <div class='alls' ><input type= 'text' placeholder= 'name' class='inputtingname' name= 'username' size='10' value='" + newdata.username + "' readonly/>&nbsp;&nbsp;&nbsp;<input type='text' class='inputting" + (newdata.endtime && new Date(newdata.endtime).getTime() < new Date().getTime() ? "W": "") +"' size='80'  maxlength='100' id= 'output' name='Text" + newdata.topicnum + "' onChange='javascript:saveValue(" + newdata.topicnum + ",this.value)' value='" +
            newdata.contents + "'readonly >&nbsp;&nbsp;<input type='datetime' class='upload' value='"+ newdata.uptime +"' readonly>&nbsp;&nbsp;<input type='text' value='until : ' class='until' readonly/><input type='datetime'id='finishtime'  class='endtime'  value='" + (newdata.endtime ? newdata.endtime : 'X') +"'/>&nbsp;&nbsp;&nbsp;<input type='text' id='locationss' size='12' class='locationsinput' value='on "+newdata.locations+"' readonly/>&nbsp;&nbsp;&nbsp;&nbsp;<label class='container'><input id='checkbox" + newdata.topicnum + "' onclick='ifcheck(this)'   type= 'checkbox' onChange='javascript:checkTopic("+ newdata.topicnum+");' "+(newdata.checkedby != 0? "checked" : "" )+" /><span class='checkmark'></span></label></div><br>";

}

// 각각의 클래스를 no로 나누어서 정의해주고 
// 예 css-checkbox0 <- 지역변수1 지역변수2
// 예 css-checkbox1 <- 지역변수1 지역변수2