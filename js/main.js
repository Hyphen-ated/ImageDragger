var stage;
var objects = [];
var layerCount = 0;
var droppedFiles = false;

function init() {
    stage = new createjs.Stage("canvas");
    stage.update();    
    
    $( "#layerlist" ).sortable(
        {placeholder: "ui-state-highlight",
        update: function() {
            var layers = $("#layerlist").sortable("toArray");
            for(var i = layers.length - 1; i >= 0; --i) {
                var j = layers[i].replace("layer", "");
                var child = stage.getChildByName("bmp" + j);
                stage.setChildIndex(child, layers.length - i - 1);
                stage.update();
            }              
        }});
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
    
    handleHash();
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
                ++layerCount;                
                var img = document.createElement('img');
                img.src = e.target.result;  
                img.onload = handleImageLoad;
                img.id = "img" + layerCount;
                
                createLayer(layerCount);
                
                // disable share button when using local images
                $("#sharebutton").attr("disabled", true).addClass("ui-state-disabled");
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
                '<input id="name'+ layernum + '" value="' + text + '"></li>")');
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

function addLayerFromWeb() {
    ++layerCount; 
    createImageByUrl($("#urltext").val(), layerCount);
}

function createImageByUrl(url, id) {
           
    var img = document.createElement("img");
    img.crossOrigin = "";
    img.src = url;
    img.onload = handleImageLoad;  
    img.id = "img" + id;
    createLayer(id);         
}


var curItem;
// allows dragging around easeljs objects on canvas in a non-jumpy way
function enableDrag(item) {
    item.on("mousedown", function(evt) {
        var offset = {  x:item.x-evt.stageX,
                        y:item.y-evt.stageY};
        curItem = item;
        var i = item.id.replace("bmp", "");
                       
        var $layer = $("#layer" + i);
        $layer.addClass("hilite");
        $("#name" + i).addClass("hilite");
        item.removeAllEventListeners("pressmove");
        
        var $freeze = $("#freeze" + i);
        if (!($freeze.prop("checked"))) {
            item.on("pressmove", function(ev) {
                item.x = ev.stageX+offset.x;
                item.y = ev.stageY+offset.y;
                stage.update();                           
            });
        }
        
    });
    item.on("pressup", function(evt) {
        curItem = null;
        var i = item.id.replace("bmp", "");
        var $layer = $("#layer" + i);
        $layer.removeClass("hilite");    
        $("#name" + i).removeClass("hilite");
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
    var id = bitmap.name =  "bmp" + img.id.replace("img", "");           
    
    var x = 100;
    var y = 100;
    var rotation = 0;
    if (id in objects) {
        x = objects[id].x;
        y = objects[id].y;
        rotation = objects[id].rotation;
    }
    
    bitmap.id = id;
    bitmap.x = x;
    bitmap.y = y;
    bitmap.rotation = rotation;
    
    bitmap.regX = img.width/2;
    bitmap.regY = img.height/2;
    
    stage.addChild(bitmap);
    stage.update();
}

function dumpStateToJSON() {
    var layerdescs = [];
    var layerlist = $("#layerlist").children();
    for (var i = 0; i < layerlist.length; ++i) {
        var desc = {};
        var layer = layerlist[i];
        var id = layer.id.replace("layer", "");
        desc.i = id;
        desc.n = $("#name" + id).val();
        
        var bmp = stage.getChildByName("bmp" + id);
        desc.x = bmp.x;
        desc.y = bmp.y;
        desc.r = bmp.rotation;
        
        var image = bmp.image;
        desc.u = image.src
        
        var freeze = $("#freeze" + id);
        desc.f = freeze.prop("checked");
        
        layerdescs.push(desc);                
    }
    return JSON.stringify(layerdescs);
}

function doShareLink() {
    var json = dumpStateToJSON();
    var url = window.location.href.split('?')[0].split('#')[0] + "#" + LZString.compressToEncodedURIComponent(json);
    $("#sharetext").val(url);
}

function loadStateFromDump(json) {
    var layerdescs = JSON.parse(json);
    for (var i = layerdescs.length - 1; i >= 0; --i) {
        var desc = layerdescs[i];        
        var id = desc.i;
        var bmp = {};
        bmp.x = desc.x;
        bmp.y = desc.y;
        bmp.rotation = desc.r;
        objects["bmp"+id] = bmp;
        createImageByUrl(desc.u, id);
        $("#name" + id).val(desc.n);
        $("#freeze"+ id).prop("checked", desc.f);
    }
}

function handleHash() {
    if (window.location.hash) {
        var json = LZString.decompressFromEncodedURIComponent(window.location.hash.replace("#", ""));
        loadStateFromDump(json);
    }
}