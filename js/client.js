// Edit me. Feel free to create additional .js files.
 'use strict'

document.addEventListener("DOMContentLoaded", function(event) {

 document.getElementById("photo--upload").addEventListener('change', handleUpload, false);

});

var canvas = document.createElement('canvas');
var ctx = canvas.getContext('2d');
var DOMURL = window.URL || window.webkitURL || window;

function handleUpload(e){
  loadOriginalImage(e);
  handleImage(e);
};

function loadOriginalImage(e) {
  var originalCanvas = document.getElementById('original');
  var originalContext = originalCanvas.getContext('2d');
    var reader = new FileReader();
    reader.onload = function(event){
      const img = new Image();
      img.onload = function() {
        originalCanvas.width = img.width;
        originalCanvas.height = img.height;
        originalContext.drawImage(img, 0, 0);
      }
      img.src = event.target.result;
    }
    reader.readAsDataURL(e.target.files[0]);
    return true;
};

    //everything runs on change of input
function handleImage(e) {
  var reader = new FileReader();
  reader.onload = function(event){
    const sourceImage = new Image();
    sourceImage.onload = function() {
      canvas.width = sourceImage.width;
      canvas.height = sourceImage.height;
      run(sourceImage);
    }
    sourceImage.src = event.target.result;
  }
  reader.readAsDataURL(e.target.files[0]);
  return true;
};
  //function to get image meta data, and coordinates associated with it.
function makeTile(imageData, x, y) {
  this.hex = rgbToHex(imageData);
  this.x = x * TILE_WIDTH;
  this.y = y * TILE_HEIGHT;
};

function readImageData(sourceImage) {
  //divide the image into 16x16px tiles
  canvas.width = (sourceImage.width / TILE_WIDTH);
  canvas.height = (sourceImage.height / TILE_HEIGHT);
  //draw the image starting at x,y coordinates of 0, 0
  ctx.drawImage(sourceImage, 0, 0, canvas.width, canvas.height);
  return ctx;
};

  //getting initial data for tiles
function getTileData(sourceImage) {
  var counter = 0
  var tile = [];
  var context = readImageData(sourceImage);
  var numX = sourceImage.width / TILE_WIDTH;
  var numY = sourceImage.height / TILE_HEIGHT;
  //getImageData built in pixel data reader function from canvas
  //returns the RGB
  var data = context.getImageData(0, 0, numX, numY).data;
  //for loop pushing the hex color into object typedArray
  for(var row = 0; row < numY; row++) {
    for(var col = 0; col < numX; col++) {
      //make new tile instance
      tile.push(new makeTile(data.subarray(counter * 4, counter * 4 + 3), col, row));
      counter++
    }
  }
  return tile;
};

function drawMos(image) {
  var finalCanvas = document.getElementById('mosaic');
  var finalCtx = finalCanvas.getContext('2d');

  finalCanvas.width = image.width;
  finalCanvas.height = image.height;

  var chunkSize, chunk, tileData;
  var hexArray = [];
  var positions = [];
  var masterSvg = [];

  //set it so each chunk equalls 16x16px squares
  chunkSize = image.width / TILE_WIDTH;
  tileData = getTileData(image);
  //split tiles into 16x16 chunks
  chunk = tileData.splice(0, chunkSize)
  //while chunks exist break it into arrays of data
  while(chunk.length !== 0) {
    for(var i = 0; i< chunk.length; i++){
      chunk.map(function(data) {
        var hex = data.hex;
        var posX = data.x;
        var posY = data.y;
        hexArray.push(hex)
        positions.push({x: posX, y: posY})
      })
    }
    //re-allocate to next chunk
    chunk = tileData.splice(0, chunkSize)
  }
  var count = hexArray.length;
  var i = 0;
  fetchNextColor(hexArray, positions, masterSvg, finalCanvas, finalCtx, count, i);
};

function fetchNextColor(hexArray, positions, arr, canvas, context, count, i) {
  hexFetch(hexArray[i])
    .then(function(response){
      return response.text();
    })
    .then(function(result){
      if(i >= count-1) {
        renderRows(arr, context, canvas);
      } else {
        arr.push({svg: result, x: positions[i].x, y: positions[i].y})
        i++;
        fetchNextColor(hexArray, positions, arr, canvas, context, count, i);
      }
    })
    .catch(function(error){
      console.log(error);
    });
};

function countIndex(index) {
  return index++;
}

//render the rows, each thru the array or svg and (x.y) positions, and place onto screen.
function renderRows(arr, ctx, canvas) {
  arr.forEach(function(data) {
    renderTile(ctx, data.svg, {x: data.x, y: data.y})
  });
};

function hexFetch(hex) {
    return fetch('/color/' + hex);
};

function getBlob(data) {
  var svgBlob = new Blob([data], {type: 'image/svg+xml'});
  return svgBlob;
};

function getUrl(blob) {
  var url = DOMURL.createObjectURL(blob);
  return url;
};

function revokeUrl(url) {
  DOMURL.revokeObjectURL(url);
};

function renderTile(ctx, svg, coords) {
  var image = new Image()
  var svgBlob = getBlob(svg);
  var url = getUrl(svgBlob);
    image.src = url;
    image.onload = function(){
      try {
        ctx.drawImage(image, coords.x, coords.y);
        ctx.imageSmoothingEnabled = false;
        ctx.mozImageSmoothingEnabled = false;
        revokeUrl(url)
      }
      catch(error){
        throw new Error("the image was probably too large, try something around 200px wide");
      }
    }
  return canvas;
};

function compToHex(item) {
  var hex = item.toString(16);
  return hex.length == 1 ? '0' + hex : hex; //look up this syntax
};

function rgbToHex(rgb) {
  return compToHex(rgb[0]) + compToHex(rgb[1]) + compToHex(rgb[2]);
};

function getHttp(svgUrl) {
  fetch(svgUrl);
};

function run(image) {
  drawMos(image);
};

//*** references ***
// https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Drawing_DOM_objects_into_a_canvas
// https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Drawing_DOM_objects_into_a_canvas
//rgb -> hex conversion functions http://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
// http://stackoverflow.com/questions/34913541/adding-an-uploaded-file-as-an-image-element-in-an-svg
