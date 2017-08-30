var stage;
var objects = [];
var layerCount = 0;
var droppedFiles = false;

function init() {
    stage = new createjs.Stage("canvas");

//    createImageByUrl("http://i.imgur.com/ryngzX3.png");
//    createImageByUrl("http://i.imgur.com/EeK0vFk.png");
//    createImageByUrl("img/google.png");
    stage.update();    
    
    $( "#layerlist" ).sortable({placeholder: "ui-state-highlight"});
    $( "#layerlist" ).disableSelection();
    
    $("#fileinput").on("change", handleFileInput);
  
    $main= $("#main");
    $main.on('dragover dragenter', function(e) {
        e.preventDefault();
        e.stopPropagation();
        $main.addClass('is-dragover');
    })
    .on('dragleave dragend drop', function(e) {
        e.preventDefault();
        e.stopPropagation();
        $main.removeClass('is-dragover');
    })
    .on('drop', function(e) { 
        e.preventDefault();
        e.stopPropagation();
        if(e.originalEvent.dataTransfer.files && e.originalEvent.dataTransfer.files.length > 0) {    
            processImageFiles(e.originalEvent.dataTransfer.files);
        }
    });
}


function processImageFiles(files) {
    for (var i = 0, f; f = files[i]; i++) {  
        processImageFile(f);
    }
}

function processImageFile(f) {      
    //ignore other kinds of files
    if (f.type.match('image.*')) {            
        var reader = new FileReader();           
        reader.onload = (function(thefile) {
            return function(e) {
                console.log("got there");
                var img = document.createElement('img');
                img.src = e.target.result;  
                putBitmapOnCanvas(img);
                ++layerCount;
                createLayer(layerCount);
            }
        })(f);
        reader.readAsDataURL(f);
    }   
}

function onFreezeChange(freezeid, checked) {
    //freezeid looks like "freeze3". checked is bool
}


function createLayer(layernum) {    
    var text = "Layer " + layernum;
    var id = "layer" + layernum;
    var $li = $('<li class="ui-state-default layer" id="'+id+'">'+
                '<span class="ui-icon ui-icon-arrowthick-2-n-s"></span>'+
                 text + '</li>")');
    var $label = $('<label for="freeze' + layernum + '" class="lockbutton">'+
                    'Freeze</label>');
    var $checkbox = $('<input type="checkbox" id="freeze'+ layernum +'">');
    $checkbox.change(function() {
        onFreezeChange(this.id, this.checked);
    });
    $label.append($checkbox);                                                     

    $li.append($label);            
    $("#layerlist").prepend($li);
    $("#layerlist").sortable('refresh');
    
}

function createLayerFromInput() {
    if(droppedFiles) {
        processImageFiles(droppedFiles);
    }
}

function handleFileInput(e) {
    droppedFiles = e.target.files;
}

function createImageByUrl(url) {
    var image = document.createElement("img");
    image.crossOrigin = "";
    image.src = url;
    image.onload = handleImageLoad;       
}


var curItem;
function enableDrag(item) {
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
    var img = event.target;
    putBitmapOnCanvas(img);
}

function putBitmapOnCanvas(img) {
    var bitmap = new createjs.Bitmap(img);
    enableDrag(bitmap);
    bitmap.rotation = 0;
    bitmap.regX = img.width/2;
    bitmap.regY = img.height/2;
    bitmap.x = 100;
    bitmap.y = 100;

    stage.addChild(bitmap);
    stage.update();
}

