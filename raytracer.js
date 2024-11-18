
function Screen()	{

	this.CANVAS_WIDTH = 1;
	this.CANVAS_HEIGHT = 1;
	this.WIDTH = CANVAS_WIDTH;
	this.HEIGHT = this.CANVAS_HEIGHT;
	this.BGCOLOR = "#ffffff";
	this.RENDER_BG_COLOR = "#ffffff"; // use method: convHexClr("d6b96f"), or use method: colour(0,0,0)
}

var RTDT = new RTDT_();

function RTDT_()	{

	this.Data = {
		PPM: [],
		f: [],
		v: [],
		vn: [],
		vt: [],
		g: [], // not currently used
		o: {},
		cache: {},
		c: new camera(WIDTH, HEIGHT, (Math.PI/4)),
		ct: {},
		l: new point_light(point(-20, 20, 40), colour(1,1,1)),
		
		presets: { camera: [], lights: [], scenes: [] }
	};

	this.DataR = {
		x_min: Infinity,
		x_max: -Infinity,
		y_min: Infinity,
		y_max: -Infinity,
		z_min: Infinity,
		z_max: -Infinity,
		
		f_begins: 0,
		v_begins: 0,
		vn_begins: 0,
		vt_begins: 0,
		
		divideValue: 100
	};
}

/** GLOBAL OBJECTS */
Data.presets.camera.push(view_transform(point(0,0,20),point(0,0,0),vector(0,1,0)));
Data.presets.camera.push(view_transform(point(0,5,8),point(0,1,0),vector(0,1,0)));
Data.presets.camera.push(view_transform(point(25,0, 25), // from
								point(0,10,0),   // to
								vector(0,1,0)));


function optionSelected()	{

	switch(document.getElementById("os").selectedIndex)	{
		
		case 0:
			WIDTH = 150;
			HEIGHT = Math.round(150*(9/16));
			Data.ct = Data.c.transform;
			Data.c = new camera(WIDTH, HEIGHT, (Math.PI/4));
			Data.c.setCTransform(ct);
			break;
		
		case 1:
			WIDTH = 500;
			HEIGHT = Math.round(500*(9/16));
			Data.ct = Data.c.transform;
			Data.c = new camera(WIDTH, HEIGHT, (Math.PI/4));
			Data.c.setCTransform(ct);
			break;
			
		case 2:
			WIDTH = 900
			HEIGHT = 550
			Data.ct = Data.c.transform;
			Data.c = new camera(WIDTH, HEIGHT, (Math.PI/4));
			Data.c.setCTransform(ct);
			break;
			
		default:
			break;
	}
}

function camPresetSelected()	{

	let v = document.getElementById("campresets");

	Data.c.setCTransform(Data.presets.camera[v.selectedIndex]);
	console.log("Set Camera to preset " + (v.selectedIndex+1) + ".");

}

function doDivide()	{
	
	try	{
		
		Data.o.divide(DataR.divideValue)
		return true
	} catch(e)	{
		
		return false
	}
}

/** INIT */

let c = document.getElementById("canvas");
let ctx = c.getContext("2d");
let loop;

function init()	{

	Data.c.setCTransform(Data.presets.camera[0]);
	
	ctx.fillStyle = BGCOLOR
	ctx.fillRect(0,0,CANVAS_WIDTH, CANVAS_HEIGHT)
}

/** END OF INIT */


/** RAYTRACER CODE */

function scene()	{
	
	let o = group()
	for (let i = 0; i < arguments.length; i++)
		o.addChild(arguments[i])
	
	return Data.o = o;
}

let g_c, g_w, g_r, g_x, g_y

function render(c, w, remaining)	{

	//clearTimeout(loop)
	g_c = c
	g_w = w
	g_r = remaining
	g_x = 0
	g_y = 0
	console.time("render")
	render2();
}


function render2()	{

	g_x =0;
	while(g_x != WIDTH) {
		let r = g_c.ray_for_pixel(g_x, g_y);
				
		let c = color_at(g_w, r, g_r)
		
		if ((c.x==0)&&(c.y==0)&&(c.z==0))
			c = RENDER_BG_COLOR
		
		c = convert(c)
		ctx.fillStyle = "#" + c.x + c.y + c.z
		
		let x = g_x + ((CANVAS_WIDTH/2) - WIDTH/2)
		let y = g_y + ((CANVAS_HEIGHT/2) - HEIGHT/2)
		
		ctx.fillRect(x,y,1,1)
				
		g_x++;
	}

	g_x = 0
	g_y++
			
	if (g_y === HEIGHT)	{
				
		clearTimeout(to)
		console.log("COMPLETED RENDER.")
		console.timeEnd("render")
		return
	}
	
	to = setTimeout(render2, 0)	
}
/*
function render2()	{

	let r = g_c.ray_for_pixel(g_x, g_y);
			
	let c = color_at(g_w, r, g_r)
	
	if ((c.x==0)&&(c.y==0)&&(c.z==0))
		c = RENDER_BG_COLOR
	
	c = convert(c)
	ctx.fillStyle = "#" + c.x + c.y + c.z
	
	let x = g_x + ((CANVAS_WIDTH/2) - WIDTH/2)
	let y = g_y + ((CANVAS_HEIGHT/2) - HEIGHT/2)
	
	ctx.fillRect(x,y,1,1)
			
	g_x++;
	if (g_x === WIDTH)	{
				
		g_x = 0
		g_y++
	}
			
	if (g_y === HEIGHT)	{
				
		clearTimeout(to)
		console.log("COMPLETED RENDER.")
		console.timeEnd("render")
		return
	}
	
	to = setTimeout(render2, 0)	
}
*/

function convert( c )	{
	
	let r = c.x;
	let g = c.y;
	let b = c.z;
	
	r>1?r=1:;
	g>1?g=1:;
	g>1?g=1:;

	r<0?r=0:;
	g<0?g=0:;
	b<0?b=0:;

	r *= 255;
	g *= 255;
	b *= 255;

	return rgbToHex( r,g,b );
}

function rgbToHex( r_in, g_in, b_in )	{

		let r = r_in.toString(16);
		let g = g_in.toString(16);
		let b = b_in.toString(16);

		if( r.length<2 )
			r = "0" + r;
		if( g.length<2 )
			g = "0" + g;
		if( r.length<2 )
			b = "0" + b;

		return { x: r, y: g, z: b };
}

function write_pixel(x, y, color)	{
	
	// ctx.fill
	ctx.fillStyle = color
	ctx.fillRect( x, y, 1, 1 )
}

/*
function render(c, w, remaining)	{
	
	console.time("render")	
	
	for (let y = 0; y < HEIGHT; y++)	{
		
		//console.log("Line " + y + " of " + HEIGHT);
		
		for (let x = 0; x < WIDTH; x++)	{
	
			let r = c.ray_for_pixel(x, y);
			
			ctx.fillStyle = convert(color_at(w, r, remaining))
			ctx.fillRect(x,y,1,1)
		}
	}
	
	console.log("COMPLETED.\n")
	console.timeEnd("render")
}
*/

/** END OF RAYTRACER CODE */

/* FILE */

function ppmObj(fn)	{
	
	return { data: Data.PPM[fn].data, width: Data.PPM[fn].width, height: Data.PPM[fn].height }
}

let OBJFILECONTENTS = "";
let FILECONTENTS = "";

function readObjectFile(e) {
  let file = e.target.files[0];
  
  if (!file) {
    return;
  }
  
  let reader = new FileReader();
  reader.onload = function(e) {
    OBJFILECONTENTS = e.target.result;
    //displayContents(OBJFILECONTENTS);
	parse_obj_file()
  }; 
  
  reader.readAsText(file);
}

function readFile(e)	{

	let file = e.target.files[0];
	
	if( !file )
		return 0;
	
	let reader = new FileReader();
	reader.onload = function( e )	{

		parseFileContents( file.name, e.target.result );
	}
	reader.readAsText(file);
	
	return 1;
}


function parseFileContents( fname, fcontents )	{
	
	let fext_pattern = /\.([a-zA-Z_0-9]+)$/
	const fext = fname.match( fext_pattern );
	// FILE_EXT = /\.[a-zA-Z_0-9]+$/;
	
	try	{
		// if file ext == ".rdt" then
		//eval("I = " + FILECONTENTS + ";")
		// else if file ext == ".ppm"
		
		if(!parsePPM(FILECONTENTS, fn)) 
			throw new Error("parseFileContents() FAILED!")
	} catch(e)	{
		console.log("Error loading file.")
	}
	
	// else
	
}

function parsePPM(contents, fn)	{
	// Data.PPM.push(new PPM{width, height, colour_depth, pixels[height*width], filename})
	
	let arr = contents.split("\n");
	
	if(arr[0]!="P3")	{
		return false;
	}

	let line = arr[1];
	let vals = line.split(" ")
	let width = Number(vals[0])
	let height = Number(vals[1])
	
	let bit_depth = Number(arr[2])
	
	/*
	let canvas = document.createElement('canvas');
	canvas.width = width;
	canvas.height = height;

	let ctx = canvas.getContext('2d');
	let img = ctx.getImageData(0, 0, width, height);
	let pix = img.data;
	*/
	
	
	//let arr = []
	
	//let x = 0, y = 0
	
	let pix = []
	for (let i = 3; i < arr.length; i = i + 3)	{
		
		let r = Number(arr[i])
		let g = Number(arr[i+1])
		let b = Number(arr[i+2])
		
		//r = 255, g = 33, b = 33
		//pix[ppos]=r [ppos+1]=g [ppos+2]=b [ppos+3]=255
		pix[i-3] = r, pix[i-2] = g, pix[i-1] = b;

	}
	
	//ctx.putImageData(img, 0, 0)

	let c = { data: pix, width: width, height: height }
	Data.PPM[fn] = c;

	alert("Image processed, Canvas created.")
	
	return true;
}
/* END OF FILE */

/* SPLASH SCREEN FUNCTIONS & VARIABLES */
 


/* END OF SPLASH SCREEN FUNCTIONS & VARIABLES */
