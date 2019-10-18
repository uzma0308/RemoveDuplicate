const express = require('express')
const path = require('path')
const app = express();
const PORT = process.env.PORT || 3000
const fs = require('fs');
var url = require('url') ;
const router = express.Router();
const bodyParser = require("body-parser");
var probe = require('probe-image-size');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;  
const csvWriter = createCsvWriter({  
  path: './public/likedImage.csv',
  append:true,
  header: [
    {id: 'id', title: 'Image Id'},
    {id: 'url', title: 'Image Url'}
  ]
});
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(express.static('public'))

//returns the index.html file
router.get('/',function(req,res){
  var hostname = req.headers.host; 
  var pathname = url.parse(req.url).pathname; 
  console.log('http://' + hostname + pathname);
  res.sendFile(path.join(__dirname+'/index.html'));
});

//clears the csv
router.get('/clearCSV',function(req,res){
  fs.truncate('./public/likedImage.csv', 0, function(){
    res.send("Cleared successfully");
  })
});

//fetch number of data from csv file
router.post('/getPageData',function(req,res){

  fs.readFile('./public/data.csv', 'utf8',async function(err, data)
  {
    console.log("Fetching data of page",req.body.page);
    var pagenumber = req.body.page;
      if (err)
          console.log(err);
      let lines = data.split('\n');
      var responseData = lines.slice((pagenumber-1)*100,pagenumber*100);
      var sent = [];

      for(let i = 0; i < responseData.length; i++)
      {
       
          var url = responseData[i].split(",");

          //getting images size for each image

          var size = {
            width: 0,
            height: 0,
            size: 0
          };
          // var size = await getAllImageSize(url[1]);
          // uncomment upper line to get image sizes
          
          size.size = (Number(size.size)/1024).toFixed(2);;
          var obj = {
            value : responseData[i],
            checked : false,
            size : size
          }
    
          sent.push(obj);
      }
      res.json({ data: sent });
      
  });
});
function getAllImageSize(x)
{
 try{
    return new Promise((resolve,reject)=>{

        probe(x, function (err, result) 
        {
              if (err)
              {
                console.log(err);
              }
              if(result && result.width)
              {
                var data = {
                  width: result.width,
                  height: result.height,
                  size: result.length
                }
                resolve(data);
              }
              else{
                reject(err);
              }

            });
         })
    }
    catch(e)
    {
      console.log(e);

    }

}
//storing the selected checked images to CSV file
router.post('/store',function(req,res){
    csvWriter  
      .writeRecords(req.body.image_data)
        .then(()=>{ 
          console.log('The CSV file was written successfully');
          res.send("Written succesfully");
});
});
app.use('/', router);
app.listen(PORT, () => console.log(`Listening on ${ PORT }`))

console.log('Running at Port 3000');
