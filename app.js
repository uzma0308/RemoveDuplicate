const express = require('express')
const path = require('path')
const app = express();
const PORT = process.env.PORT || 3000
const fs = require('fs');
var url = require('url') ;
const router = express.Router();
const bodyParser = require("body-parser");
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

router.get('/',function(req,res){
  var hostname = req.headers.host; 
  var pathname = url.parse(req.url).pathname; 
  console.log('http://' + hostname + pathname);
res.sendFile(path.join(__dirname+'/index.html'));
});

router.get('/clearCSV',function(req,res){
  fs.truncate('./public/likedImage.csv', 0, function(){
    console.log('done');
    res.send("Cleared successfully");
  })
});

router.post('/getPageData',function(req,res){

  fs.readFile('./public/data.csv', 'utf8', function(err, data)
  {
    console.log(req.body.page);
    var pagenumber = req.body.page;
      if (err)
          console.log(err);
      let lines = data.split('\n');
      var responseData = lines.slice((pagenumber-1)*500,pagenumber*500);
      fs.readFile('./public/likedImage.csv', 'utf8', function(err, data2)
      {
        
        if (err)
        console.log(err);
        let line = data2.split('\n');
        var likeData =[];
        line.map((x)=>{
          var data = x.split(',');
          if(data!= undefined && data!='"')
          {
            likeData.push(data[0]);
          }
        })

       
        var sentResp = [];
        var obj ={};
        responseData.map((x)=>{
            obj={};
            obj["value"] = x;
            var get = x.split(',');
            
            if(likeData.indexOf(get[0])== -1){
              obj["checked"] = false;
            }
            else
            {
              obj["checked"] = true;
            }
            sentResp.push(obj);
        })
       
        res.json({ data: sentResp });

      });
      
  });
});

router.post('/store',function(req,res){
    console.log(req.body.image_data);
    csvWriter  
      .writeRecords(req.body.image_data)
        .then(()=>{ 
          console.log('The CSV file was written successfully');
          res.send("deleted succesfully");
});
});
app.use('/', router);
app.listen(PORT, () => console.log(`Listening on ${ PORT }`))

console.log('Running at Port 3000');
