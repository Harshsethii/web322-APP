/*********************************************************************************
*  WEB322 – Assignment 05
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Harsh Sethi Student ID: 121889216 Date: 16/11/2022
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
/***********************************************************************
**********
* WEB322 – Assignment 03
* I declare that this assignment is my own work in accordance with Seneca Academic
Policy. No part * of this assignment has been copied manually or electronically from any
other source
* (including 3rd party web sites) or distributed to other students.
*
* Name: Harsh Sethi
  Student ID: 121889216
  Date: 14/10/2022

*
* Online (cyclic) Link: https://bored-tick-wetsuit.cyclic.app/

************************************************************************
********/


var express = require("express");
var app = express();
var path = require('path');
const multer = require("multer");
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const exphbs = require('express-handlebars');
const stripJs = require('strip-js');
var blogservice = require(__dirname + '/blog-service.js');

var HTTP_PORT = process.env.PORT || 8080;
app.use(express.urlencoded({extended: true}));

app.engine('.hbs', exphbs.engine({ 
  extname: ".hbs", 
  defaultLayout: "main",
  helpers: {
      navLink: function(url, options){
          return '<li' + 
              ((url == app.locals.activeRoute) ? ' class="active" ' : '') + '><a href="' + url + '">' + options.fn(this) + '</a></li>'; },
      equal: function (lvalue, rvalue, options) {
          if (arguments.length < 3)
              throw new Error("Handlebars Helper equal needs 2 parameters");
          if (lvalue != rvalue) {
              return options.inverse(this);
          } else {
              return options.fn(this);
          }
      },
      safeHTML: function(context){
          return stripJs(context);
      },
      formatDate: function(dateObj){
        let year = dateObj.getFullYear();
        let month = (dateObj.getMonth() + 1).toString();
        let day = dateObj.getDate().toString();
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2,'0')}`;
      },
              
  } 
}));

app.set("view engine", ".hbs");

function onHttpStart(){
    console.log('Express http server listening on ' + HTTP_PORT);
}

cloudinary.config({
    cloud_name: 'dbh1bwqlk',
    api_key: '131489383184657',
    api_secret: 'FFYxWTN0LH20vqMIc6pqHlnRNnw',
    secure: true
});

const upload = multer() // no { storage: storage }

app.use(express.static('public'));

app.use(function(req,res,next){
  let route = req.path.substring(1);
  app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
  app.locals.viewingCategory = req.query.category;
  next();
});


app.get('/', (req, res) =>
{
    res.redirect('/blog')
});

app.get('/about', (req, res) => 
{
  res.render(path.join(__dirname + "/views/about.hbs"));  
});

app.get('/blog', async (req, res) => {

  let viewData = {};

  try{
      let posts = [];

      if(req.query.category){
          posts = await blogservice.getPublishedPostsByCategory(req.query.category);
      }else{
          posts = await blogservice.getPublishedPosts();
      }

      posts.sort((a,b) => new Date(b.postDate) - new Date(a.postDate));

      let post = posts[0]; 

      viewData.posts = posts;
      viewData.post = post;

  }catch(err){
      viewData.message = "no results";
  }

  try{
      let categories = await blogservice.getCategories();

      viewData.categories = categories;
  }catch(err){
      viewData.categoriesMessage = "no results"
  }

  res.render("blog", {data: viewData})

});

app.get('/blog/:id', async (req, res) => {

  let viewData = {};

  try{
      let posts = [];

      if(req.query.category){
          posts = await blogservice.getPublishedPostsByCategory(req.query.category);
      }else{
          posts = await blogservice.getPublishedPosts();
      }

      posts.sort((a,b) => new Date(b.postDate) - new Date(a.postDate));

      viewData.posts = posts;

  }catch(err){
      viewData.message = "no results";
  }

  try{
      viewData.post = await blogservice.getPostById(req.params.id);
  }catch(err){
      viewData.message = "no results"; 
  }

  try{
      let categories = await blogservice.getCategories();

      viewData.categories = categories;
  }catch(err){
      viewData.categoriesMessage = "no results"
  }

  res.render("blog", {data: viewData})
});

app.get("/posts", function (req, res) {

    if (req.query.category) {
      blogservice.getPostsByCategory(req.query.category).then((data) => {
        if(data.length>0)
        {
          res.render("posts", {posts: data});
        }
        else{
          res.render("posts", {message: "no results"});
        }
        
      }).catch(function(err){
        res.render("posts", {message: "no results"});
      })
    }

     else if (req.query.minDate) {
      blogservice.getPostsByMinDate(req.query.minDate).then((data) => {
        res.render("posts", {posts: data});
      }).catch(function(err){
        res.render("posts", {message: "no results"});
      })
    }

    else {
      blogservice
        .getAllPosts()
      .then(function (data) {
        res.render("posts", {posts: data});
      })
      .catch(function (err) {
        res.render("posts", {message: "no results"});
      });
    }
  });

  app.get('/post/:id',(req,res)=>{
    blogservice.getPostById(req.params.id).then((data)=>{
 
     res.json(data);
    }) .catch(function (err) {
       res.json({ message: err });
     });
 
 
   });

app.get("/categories", function (req, res)
{
    blogservice.getCategories().then(function (data)
    {
      if(data.length>0){
        res.render("categories", {categories: data});
      }
      else{
        res.render("categories", {message: "no results"});
      }
    }).catch(function(err) {
      res.render("categories", {message: "no results"});
    })
});

app.get("/categories/add", (req, res) => {
  res.render("addCategory");
});

app.post("/categories/add", (req, res) => {
  blogservice.addCategory(req.body).then(() => {
    res.redirect("/categories");
  });
});

app.get("/categories/delete/:id", (req, res) => {
  blogservice.deleteCategoryById(req.params.id)
    .then(() => {
      res.redirect("/categories");
    })
    .catch((err) => {
      res.status(500).render("categories", {
        errorMessage: "Unable to Remove Category / Category Not Found",
      });
    });
});

app.get('/posts/add', function (req,res)
{
  blogservice
    .getCategories()
    .then((data) => res.render("addPost", { categories: data }))
    .catch((err) => res.render("addPost", { categories: [] }));

});

app.post("/posts/add", upload.single("featureImage"), (req,res)=>{

  if(req.file){
      let streamUpload = (req) => {
          return new Promise((resolve, reject) => {
              let stream = cloudinary.uploader.upload_stream(
                  (error, result) => {
                      if (result) {
                          resolve(result);
                      } else {
                          reject(error);
                      }
                  }
              );
  
              streamifier.createReadStream(req.file.buffer).pipe(stream);
          });
      };
  
      async function upload(req) {
          let result = await streamUpload(req);
          console.log(result);
          return result;
      }
  
      upload(req).then((uploaded)=>{
          processPost(uploaded.url);
      });
  }else{
      processPost("");
  }

  function processPost(imageUrl){
      req.body.featureImage = imageUrl;
      req.body.postDate = new Date().toISOString().split('T')[0];
      blogservice.addPost(req.body).then(post=>{
          res.redirect("/posts");
      }).catch(err=>{
          res.status(500).send(err);
      })
  }   
});

app.get("/posts/delete/:id", (req, res) => {
  blogservice.deletePostById(req.params.id)
    .then(() => {
      res.redirect("/posts");
    })
    .catch((err) => {
      res.status(500).render("posts", {
        errorMessage: "Unable to Remove Post / Post Not Found",
      });
    });
});


app.get('*', function(req, res){
    res.status(404).send("Page Not Found!");
  });

blogservice.initialize().then(() => 
{
    app.listen(HTTP_PORT, onHttpStart());
}).catch (() => {
    console.log("ERROR : From starting the server");
});