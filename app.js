var bodyParser = require("body-parser"),
methodOverride = require("method-override"),
expressSanitizer = require("express-sanitizer"),
mongoose       = require("mongoose"),
express        = require("express"),
app            = express();



mongoose.connect("mongodb://localhost/RESTful_BlogApp");
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitizer());
app.use(methodOverride("_method"));


var blogSchema = new mongoose.Schema({
    title: String,
    image: String,
    body: String,
    created: {type: Date, default: Date.now}
});
var Blog = mongoose.model("Blog", blogSchema);


//  Blog.create({
//      title: "Test Blog",
//      body: "Hello this is a blog Post",
//      image: "https://i.pinimg.com/736x/57/ae/9a/57ae9a373318e844c4e5732f09e5acb8--cool-anime-girl-beautiful-anime-girl.jpg"
//  });


app.get("/", function(req, res){
   res.redirect("/blogs"); 
});


app.get("/blogs", function(req, res){
   Blog.find({'creator.user_id': req.params.user_id}, null, {sort: {'_id': -1}}, function(err, blogs){
       if(err){
           console.log("ERROR!!!");
       } else {
          res.render("index", {blogs: blogs}); 
       }
   });
});


app.get("/blogs/new", function(req, res){
    res.render("new");
});


// create blog
app.post("/blogs", function(req, res){
    console.log(req.body);
    req.body.blog.body = req.sanitize(req.body.blog.body)
    console.log("===========")
    console.log(req.body);
    Blog.create(req.body.blog, function(err, newBlog){
        if(err){
            res.render("new");
        } else {
            //then, redirect to the index
            res.redirect("/blogs");
        }
    });
});


// show route
app.get("/blogs/:id", function(req, res){
   Blog.findById(req.params.id, function(err, foundBlog){
       if(err){
           res.redirect("/blogs");
       } else {
           res.render("show", {blog: foundBlog});
       }
   })
});



app.get("/blogs/:id/edit", function(req, res){
    Blog.findById(req.params.id, function(err, foundBlog){
        if(err){
            res.redirect("/blogs");
        } else {
            res.render("edit", {blog: foundBlog});
        }
    });
});


//update blog
app.put("/blogs/:id", function(req, res){
   req.body.blog.body = req.sanitize(req.body.blog.body)
   Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog){
      if(err){
          res.redirect("/blogs");
      }  else {
          res.redirect("/blogs/" + req.params.id);
      }
   });
});


app.delete("/blogs/:id", function(req, res){
   Blog.findByIdAndRemove(req.params.id, function(err){
       if(err){
           res.redirect("/blogs");
       } else {
           res.redirect("/blogs");
       }
   })
});


app.listen(process.env.PORT, process.env.IP, function(){
    console.log("SERVER IS RUNNING!");
});