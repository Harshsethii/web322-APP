/*********************************************************************************
*  WEB322 – Assignment 02
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Harsh Sethi Student ID: 121889216 Date: 9/27/2022
*
*  Online (Cyclic) Link: ________________________________________________________
*
********************************************************************************/ 

var express = require("express");
var app = express();
var path = require("path");
var blogservice = require(__dirname + '/blog-service.js');
//var blogservice = require(__dirname + '/blog-service.js');
var HTTP_PORT = process.env.PORT || 8080;

// call this function after the http server starts listening for requests
function onHttpStart() {
  console.log("Express http server listening on: " + HTTP_PORT);
}

// setup the static folder that static resources can load from
// like images, css files, etc.
app.use(express.static("public"));

// setup a 'route' to listen on the default url path (http://localhost)
app.get('/', (req, res) =>
{
    res.redirect('/about')
});

// setup another route to listen on /about
app.get('/about', (req, res) => 
{
    res.sendFile(path.join(__dirname + "/views/about.html"));
});

app.get("/blog", function (req, res)
{
    blogservice.getPublishedPosts().then(function(data)
    {
        res.json({data});
    }).catch(function(err) {
        res.json({message: err});
    })
});

app.get("/posts", function (req, res) {
      blogservice.getAllPosts().then(function (data) {
        res.json(data);
      })
      .catch(function (err) {
        res.json({ message: err });
      });
    }
  );

app.get("/categories", function (req, res)
{
    blogservice.getCategories().then(function (data)
    {
        res.json({data});
    }).catch(function(err) {
        res.json({message: err});
    })
});

app.use((req, res) => {
    res.status(404).send("Page Not Found");
}); 

blogservice.initialize()
.then(() => {
    // setup http server to listen on HTTP_PORT
    app.listen(HTTP_PORT, onHttpStart);
})
.catch(() => {
  console.log("ERROR : From starting the server");
});
