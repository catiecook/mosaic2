// Edit me. Feel free to create additional .js files.
 'use strict'
 document.addEventListener("DOMContentLoaded", function(event) {
  //reference https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Drawing_DOM_objects_into_a_canvas
  var DOMURL = window.URL || window.webkitURL || window; //to be used in tile-rendering

  var canvas = document.getElementById('original');
  var ctx = canvas.getContext('2d');
  var sourceImage = new Image();
  var finalCanvas = document.getElementById('mosaic');
  var finalCtx = canvas.getContext('2d');
     //load the image
  var imageLoad = document.getElementById("photo--upload");
  imageLoad.addEventListener('change', handleImage, false);
  //handleImage()


  //pull in URL to gethttprequest + :hex inside a promise.all
  //get canvas

//everything runs on change of canvas
  function handleImage(e) {
    var reader = new FileReader();
    reader.onload = function(event){
      sourceImage = new Image();
      //once the image loads
      sourceImage.onload = function() {
        console.log("source image loaded")
        canvas.width = sourceImage.width;
        canvas.height = sourceImage.height;
      //run calls all worker funcitons
        run(sourceImage);
      }
      sourceImage.src = event.target.result;
    }
    reader.readAsDataURL(e.target.files[0]);
  };

  //function to get image meta data, and coordinates associated with it.
  function makeTile(imageData, x, y) {
    console.log("makeTile");
    this.hex = rgbToHex(imageData);
    this.x = x * TILE_WIDTH;
    this.y = y * TILE_HEIGHT;
  };

  function readImageData(sourceImage) {
    console.log("readImageData function");
    //divide the image into 16x16px tiles
    canvas.width = (sourceImage.width / TILE_WIDTH);
    canvas.height = (sourceImage.height / TILE_HEIGHT);
    //draw the image starting at x,y coordinates of 0, 0
    ctx.drawImage(sourceImage, 0, 0, canvas.width, canvas.height);
    console.log(ctx);
    return ctx;
  };

//getting initial data for tiles
  function getTileData(sourceImage) {

    var counter = 0
    var tile = [];
  //read original image data to be placed into tiles
    var context = readImageData(sourceImage);

  //numX and numY is the width and heigh of the image. Variable to change upon uploaded image
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
  // console.log(tile);
    return tile;
  };

  function drawMos(image) {
    var chunkSize, chunk, tileData;
    var hexArray = [];
    var positions = [];
    var allSvg = [];
    var masterSvg = [];


    //making the canvas the correct dimensions
    canvas.width = image.width;
    canvas.height = image.height;

    chunkSize = image.width / TILE_WIDTH;
    tileData = getTileData(image);
    //split tiles into 16x16 chunks
    chunk = tileData.splice(0, chunkSize)
    //while chunks exist
    for(var i = 0; i< chunk.length; i++){
      chunk.map(function(data) {
        //returns single svg
        var hex = data.hex;
        var posX = data.x;
        var posY = data.y;

        hexArray.push(hex)
        positions.push({x: posX, y: posY})
        //push promises into array of objects
        //allSvg.push({data: fetch('/color/' + hex), x: posX, y: posY})
      })
    }
    Promise.all(hexArray.map(hex => fetch('/color/' + hex)))
      .then(data => Promise.all(data.map(r => r.text()) ))
      .then(result => {
        console.log(positions);
        for(var i = 0; i < result.length; i++) {
          masterSvg.push({svg: result[i], x: positions[i].x, y: positions[i].y})
        }
        console.log(masterSvg);
    })

    // console.log("here", allSvg);
    // for(var i = 0; i < allSvg.length; i++){
    //   console.log(allSvg[i].data);
    // }

    renderRows(allSvg)
  }

  function renderRows(arr) {
    // for(var i =0; i< arr.length)
    // arr.forEach(function(data){
    //   console.log("here");
    //   var img = new Image();
    //   var svgBlob = new Blob(data, {type: 'image/svg+xml'});
    //   var url = DOMURL.createObjectURL(svgBlob);
    //   console.log(url);
    //   img.onload = function () {
    //     finalCtx.drawImage(img, arr.x, arr.y);
    //     DOMURL.revokeObjectURL(url);
    //   }
    //   img.src = url;
    // })
  };


  //***got the equation for rgb -> hex conversion functions at http://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
  function compToHex(item) {
    var hex = item.toString(16);
    return hex.length == 1 ? '0' + hex : hex; //look up this syntax
  }

  function rgbToHex(rgb) {
    return compToHex(rgb[0]) + compToHex(rgb[1]) + compToHex(rgb[2]);
  }

  //reference http://stackoverflow.com/questions/34913541/adding-an-uploaded-file-as-an-image-element-in-an-svg
  function getHttp(svgUrl) {
    fetch(svgUrl);
  }

  // };

function run(image) {
  // getTileData(image)
  drawMos(image);


    // var input = document.getElementById('mosaic');
    // input.addEventListener('change', function() {
    //   console.log("something changed");
    //   handleImage.call(
    //     this.files[0], function(image) {
    //       var canvas = drawMos(image);
    //     })
    // }, false)
  };
 }); //end doc listen
