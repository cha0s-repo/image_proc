var jimp = require("jimp");
var fs=require('fs');
var path = require('path');

function process(ff)
{
    var files=fs.readdirSync(ff);
    for(fn in files)
    {
            if (files[fn].indexOf('bmp') > 0)
            {
                processImage(ff+'/'+files[fn]);
            
            }
    }
}

function processImage(fname)
{
    jimp.read(fname, function (err, image) {

        image.dither565();
        image.greyscale();
        image.blur( 5 ); 
        var HP = 0;
        var header = 0;
        var alpha = 0.05988;
        var prev;
        var fixedp;
        var big = 0;

        var tmpdot = new Array(image.bitmap.height);
        for (var i = 0; i < image.bitmap.height; i++)
        {
            tmpdot[i] = new Array(image.bitmap.width);
        }
        

        for (var i = 0; i < image.bitmap.height; i++)
        {

            prev = image.getPixelColor(0,i) ;
            fixedp = 0;
            for (var j = 1; j <image.bitmap.width; j++)
            {
                cur = image.getPixelColor(j, i) ;
                fixedp = Math.floor(alpha * (fixedp + prev- cur)) ;
                if (fixedp < 0)
                {
                    fixedp = 0;
                }

                tmpdot[i][j] = fixedp;
                prev = cur;
            }

            prev = image.getPixelColor(image.bitmap.width-1,i) ;
            fixedp = 0;
            for (var j = image.bitmap.width-2; j >=0; j--)
            {
                cur = image.getPixelColor(j, i) ;
                fixedp = Math.floor(alpha * (fixedp + prev- cur)) ;
                if (fixedp < 0)
                {
                    fixedp = 0;
                }

                if (fixedp > tmpdot[i][j])
                {
                     tmpdot[i][j] = fixedp;
                }

                prev = cur;
            }

          
        }

        var lop;
        var base;
        big = 0;
        for (var i = 0; i < image.bitmap.height; i++)
        {
            fixedp = 0;
            for (var j = 5; j < image.bitmap.width-5; j++)
            {
                
                lop = Math.min(
                    tmpdot[i][j],
                    tmpdot[i][j+2],
                    tmpdot[i][j+3],
                    tmpdot[i][j-2],
                    tmpdot[i][j-3]);
               
                image.setPixelColor(lop| 0xff000000, j, i);

            }
          
        }

        image.greyscale(); 

        image.write(fname.replace('.bmp', '_re.jpg'));
         console.log("Processing ..."+fname+' done.');
    });
}

process('test');