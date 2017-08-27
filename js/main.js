var stage;
var objects = [];

function init() {
    stage = new createjs.Stage("canvas");

    createImage("http://i.imgur.com/ryngzX3.png");
    createImage("http://i.imgur.com/EeK0vFk.png");
    createImage("img/google.png");
    stage.update();    
    
    $( "#layerlist" ).sortable({placeholder: "ui-state-highlight"});
    $( "#layerlist" ).disableSelection();
}

var createImage = function(url) {
    var image = document.createElement("img");
    image.crossOrigin = "";
    image.src = url;
    image.onload = handleImageLoad;       
}


var curItem;
enableDrag = function (item) {
    item.on("mousedown", function(evt) {
        var offset = {  x:item.x-evt.stageX,
                        y:item.y-evt.stageY};
        curItem = item;
        item.on("pressmove", function(ev) {
            item.x = ev.stageX+offset.x;
            item.y = ev.stageY+offset.y;
            stage.update();
        });
    });
    item.on("pressup", function(evt) {
        curItem = null;
    });
}

document.onkeydown = function(e) {
    if(!curItem) return;
    if (e.keyCode == 37) {
        curItem.rotation =  (curItem.rotation - 90) % 360;        
    } else if (e.keyCode == 39 ) {
        curItem.rotation =  (curItem.rotation + 90) % 360;
    }
    
    
    stage.update();
    
}

function handleImageLoad(event) {
    var image = event.target;
    var bitmap = new createjs.Bitmap(image);
    enableDrag(bitmap);
    bitmap.rotation = 0;
    bitmap.regX = image.width/2;
    bitmap.regY = image.height/2;
    bitmap.x = 100;
    bitmap.y = 100;

    stage.addChild(bitmap);
    stage.update();
}

