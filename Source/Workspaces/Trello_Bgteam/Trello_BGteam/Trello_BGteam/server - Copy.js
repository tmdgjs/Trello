var express = require('express');

var app = express();

app.get("/", function (req, res) {
    res.sendFile(__dirname + "/meal.zip");
})
app.listen(80, function () {
    console.log("Go!");
});
