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

        console.log("arrInput=" + arrInput[intI]);
        console.log("arrInputValue=" + arrInputValue[intI]);

        document.getElementById('parah').innerHTML += createInput(arrInput[intI], arrInputValue[intI], checkInputValue[intI]); // 생성하는 함수

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
function createInput(id, value, value2) {

    console.log("value=" + value);
    checkID++;
    return "  <input type='text' class='inputting' size='190'  maxlength='100' id= 'output' name='Text" + boxID + "' onChange='javascript:saveValue(" + boxID + ",this.value)' value='" +
        value + "' > <label class='container'><input id= 'checkbox" + checkID + "'  type= 'checkbox' onChange='javascript:saveValue2(" + checkID + ",this.checked)' " + value2 + " /><span class='checkmark'></span></label><br><br>";

}


// 각각의 클래스를 no로 나누어서 정의해주고 
// 예 css-checkbox0 <- 지역변수1 지역변수2
// 예 css-checkbox1 <- 지역변수1 지역변수2