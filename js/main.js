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
    if (e.keyCode == 37 && curItem) {
        curItem.rotation -= 90;
    } else if (e.keyCode == 39 && curItem) {
        curItem.rotation += 90;
    }
}
function init() {
    stage = new createjs.Stage("canvas");
    
    var circle = new createjs.Shape();
        circle.graphics.beginFill("DeepSkyBlue").drawCircle(0, 0, 50);
        circle.x = 100;
        circle.y = 100;
        circle.rotation = 0;
        enableDrag(circle);
        
    stage.addChild(circle);
      
      
    shape2 = new createjs.Shape();
     shape2.graphics.beginFill(createjs.Graphics.getRGB(255,0,0));
     shape2.graphics.rect(0,0,100,60);
     shape2.regX = 50;
     shape2.regY = 30;
     shape2.x = 200;
     shape2.y = 200;
     shape2.rotation = 0;
     enableDrag(shape2);
     stage.addChild(shape2);  


    var image = new Image();
    image.src = "img/google.png";
    image.onload = handleImageLoad;
    
    
    stage.update();
}

function handleImageLoad(event) {
    var image = event.target;
    var bitmap = new createjs.Bitmap(image);
    enableDrag(bitmap);
    bitmap.rotation = 0;
    stage.addChild(bitmap);
    stage.update();
}

