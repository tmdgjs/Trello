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

var arrInput = new Array(0);  //�� �� ������ ����ִ� �迭
var arrInputValue = new Array(0);//�� �� �ؽ�Ʈ ���� ������ �ִ� �迭
var checkInputValue = new Array("");//�� �� üũ ���� ������ �ִ� �迭
var boxID = 0;
var checkID = 0;


function addInput() {
    arrInput.push(arrInput.length);
    arrInputValue.push("");
    checkInputValue.push("");
    console.log("arrInputlength=" + arrInput.length);
    display(); // ���� ������ conloseâ�� ����ش�.
}

function display() {
    document.getElementById('parah').innerHTML = "";
    for (intI = 0; intI < arrInput.length; intI++) {

        console.log("arrInput=" + arrInput[intI]);
        console.log("arrInputValue=" + arrInputValue[intI]);

        document.getElementById('parah').innerHTML += createInput(arrInput[intI], arrInputValue[intI], checkInputValue[intI]); // �����ϴ� �Լ�

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

// �Է�â�� �ϳ� ����� �ش�.
function createInput(id, value, value2) {

    console.log("value=" + value);
    checkID++;
    return "  <input type='text' class='inputting' size='190'  maxlength='100' id= 'output' name='Text" + boxID + "' onChange='javascript:saveValue(" + boxID + ",this.value)' value='" +
        value + "' > <label class='container'><input id= 'checkbox" + checkID + "'  type= 'checkbox' onChange='javascript:saveValue2(" + checkID + ",this.checked)' " + value2 + " /><span class='checkmark'></span></label><br><br>";

}


// ������ Ŭ������ no�� ����� �������ְ� 
// �� css-checkbox0 <- ��������1 ��������2
// �� css-checkbox1 <- ��������1 ��������2