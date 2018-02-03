// Modules
var http = require("http");
const express = require('express')
const app = express()
var ejs = require('ejs')
let bodyParser = require('body-parser');
var fs = require('fs')
var path = require('path');


// Config
// set the view engine to ejs
app.set('view engine', 'ejs');
// Static files
app.use('/static', express.static(path.join(__dirname, 'public')))
// add bodyParser Middelwear
app.use(bodyParser.urlencoded({ extended: false }))



// Models
var Message = require('./models/message');

// Routing
app.get('/', (req, res) => {
  res.render('index.ejs');  
})

app.post('/', (req, res) => {
  
    let m = new Message();
    m.create((err, data) => {
      if(err){
        console.log(err)
      }else{}
    },req.body.message)

    res.render('index.ejs'); 
})

app.get('/list', (req, res) => {
  let m = new Message();
  m.list(function(err,data) {
    if(!err){
      let rows = data
      console.log('rows : ',rows)
      res.render('liste.ejs',{rows:rows}); 
    }
})


   
})


app.listen(3000, () => console.log('Example app listening on port 3000!'))





