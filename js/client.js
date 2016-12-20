// Edit me. Feel free to create additional .js files.
 'use strict'
 document.addEventListener("DOMContentLoaded", function(event) {
   var SVG_URL = '/color/';
   //get canvas
   var canvas = document.getElementById('original');
   var ctx = canvas.getContext('2d');
   var sourceImage;
   var finalCanvas = document.getElementById('mosaic');
   //load the image
   var imageLoad = document.getElementById("photo--upload");
   imageLoad.addEventListener('change', handleImage, false);

//everything runs on change of canvas
  function handleImage(e) {
    console.log("image loaded function");
    var reader = new FileReader();
    reader.onload = function(event){
      sourceImage = new Image();
      //once the image loads
      sourceImage.onload = function() {
        // canvas.width = sourceImage.width;
        // canvas.height = sourceImage.height;
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
    // console.log("cancvas width / tilewidth:", canvas.width);
    // console.log("original image width:", canvas.width * 16);
    canvas.height = (sourceImage.height / TILE_HEIGHT);
    //draw the image starting at x,y coordinates of 0, 0
    ctx.drawImage(sourceImage, 0, 0, canvas.width, canvas.height);
    return ctx;
  };

//getting initial data for tiles
  function getTileData(sourceImage) {
    var numX,
        numY,
        data;

    var counter = 0
    var tile = [];

  //read original image data to be placed into tiles
    var context = readImageData(sourceImage);

    numX = sourceImage.width / TILE_WIDTH;
    numY = sourceImage.height / TILE_HEIGHT;
  //getImageData built in pixel data reader function from canvas
  //returns the RGB
    data = context.getImageData(0, 0, numX, numY).data;
  //for loop pushing the hex color into object typedArray
    for(var row = 0; row < numY; row++) {
      for(var col = 0; col < numX; col++) {
        tile.push(new makeTile(data.subarray(counter * 4, counter * 4 + 3), col, row));
        counter++
      }
    }
  // console.log(tile);
    return tile;
  };

  function drawMos(image) {
    console.log("drawMos");

    var chunkSize, chunk, tileData;
    var promise = [];
    //making the canvas the correct dimensions
    canvas.width = image.width;
    canvas.height = image.height;

    chunkSize = image.width / TILE_WIDTH;
    tileData = getTileData(image);
  console.log(tileData);
    //split tiles into 16x16 chunks
    chunk = tileData.splice(0, chunkSize)
  console.log(chunk);
    //while chunks exist
    for(var i = 0; i< chunk.length; i++){
      chunk.map(function(data) {
        return getSVG(data)
      })
      chunk = tileData.splice(0, chunkSize)
      console.log(chunk.length);
    }
    // while(chunk.length > 0){
    //   promise.push(
    //     Promise.all(chunk.map(function(data) {
    //       return getSVG(data);
    //     })))
    //     chunk = tileData.splice(0, chunkSize)
    // }
    renderRows(promise)
  }
//I changed stuff here to make renderRows its own outside function. may cause issues
//might need to call this in the above function and then return the canvas there.
  function renderRows(promise) {
    console.log("render rows function");

    promise.shift()
      .then((res)=> {
        res.forEach((result) => {
          renderSVGTile(ctx, result.svg, {x: result.x, y: result.y});
        });
      });
      return canvas;
  };

  function createSVGUrl(svg) {
    console.log("make SVG function");

    var blob = new Blob([svg], {type: 'image/svg+xml;charset=utf-8'});
    return DOMURL.createObjectURL(blob);
  };

  function renderTile(ctx, svg, position) {
    console.log("render tiles function");

    var img = new Image();
    var url = createSVGUrl(svg);
    img.onload = function () {
      try {
        ctx.drawImgae(img, position.x, position.y);
      }
      catch(err) {
        console.log(err);
      }
    }
    img.src = url;
  };

//this function converts the image to SVG
  function getSVG(pixelData) {
    console.log("get svg");
    return getImage(SVG_URL)
      .then((svg) => {
        return {svg: svg, x: pixelData.x, y: pixelData.y}
      })
        .catch((err)=> {
          console.log((err));
        });

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
  function getImage() {
    var reader = new FileReader();
    reader.onload = function(e) {
      document.getElementByTagName('image')[0].setAttributeNS(sourceImage, "href", e.target.result)
    };
    reader.readAsDataURL(this.files[0])
  };

//not needed because of image upload
  // function httpGet(url) {
  //   console.log("get image url??");
  //   return new Promise((res, rej)=> {
  //     var require = new XMLHttpRequest();
  //     request.open('GET', url);
  //     request.onload = (() => {
  //       res(request.response)
  //     })
  //   })
  // };

function run(image) {
  console.log("#2 in run");
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
