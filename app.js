const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');
var url = require('url') ;
const cool = require('cool-ascii-faces')
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

router.post('/getPageData',function(req,res){

  fs.readFile('./public/inspirationalImage2.csv', 'utf8', function(err, data)
  {
    console.log(req.body.page);
    var pagenumber = req.body.page;
      if (err)
          console.log(err);
      let lines = data.split('\n');
      var responseData = lines.slice((pagenumber-1)*10,pagenumber*10);
      res.json({ data: responseData });
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
router.get('/cool', (req, res) => res.send(cool()))
    //var idsToSearchFor = (req.body.imagesId || []).map((el)=> Number(el));
    // fs.readFile('./public/data.csv', 'utf8', function(err, data)
    //   {
    //       if (err)
    //       {
    //           console.log(err);
    //       }
    //       let linesExceptFirst = data.split('\n');
    //       let linesArr = linesExceptFirst.map(line=>line.split(','));
    //       let output = linesArr.filter((x, index) =>idsToSearchFor.indexOf(Number(x[1])) == -1).join("\n");
    //       //console.log(output);
          
    //       fs.writeFileSync('./public/likedImage.csv', output);
    //       res.send("deleted succesfully");
    //   });

    });

app.use('/', router);
app.listen(process.env.port || 3000);

console.log('Running at Port 3000');





// var data = [];
// for(var i = 0;i<10667;i++)
// {
 
//     var x ={
//         id:"inspirational_image_"+i,
//         url:"https://s3.ap-south-1.amazonaws.com/couchfashiondressimages/inspiration+("+i+").jpg"
//     }
//     data.push(x);
// }
//   csvWriter  
//     .writeRecords(data)
//     .then(()=> console.log('The CSV file was written successfully'));