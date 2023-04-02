//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose=require('mongoose')
const _=require('lodash');



const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

const itemSchema={
  name:String
}

const items = ["Buy Food", "Cook Food", "Eat Food"];
const listSchema={
  name:String,
  items:[itemSchema]
}
const List=mongoose.model("List",listSchema);
const workItems = [];

main().catch(err => console.log(err));

async function main() {
    await mongoose.connect('mongodb+srv://nivinp1621:nivin123@cluster0.kncd1pa.mongodb.net/todolistDB');
    console.log("Connected");

    

    const Item=mongoose.model("Item",itemSchema);

    const item1=new Item({
      name:"Welcome to our todolist page"
    })
    const item2=new Item({
      name:"Hit + to add a new item"
    })
    const item3=new Item({
      name:"Press this to delete an item"
    })

    const defaultItems=[item1,item2,item3];

  
  
  
    app.get("/", function(req, res) {

      Item.find()
      .then(function (doitems) {
        if(doitems==0){
          Item.insertMany(defaultItems)
          .then(function () {
          
            console.log("Succesfully added 3 items to default list.")
            res.redirect("/");
        })
        
        .catch(function (err) {
          console.log(err);
          ;
        });
        }
        else{
          res.render("list", {listTitle:"Today", newListItems: doitems});
        }
          
          // doitems.forEach(item => {
          //    console.log(item);
            
             
          // });
          
      })
      
      .catch(function (err) {
        console.log(err);
        ;
      });
      
        
      
      });

      app.get('/favicon.ico', (req, res) => res.status(204).end()); 

      app.get("/:customListName",function(req,res){
        const customListName  =_.capitalize(req.params.customListName);
        List.findOne({name:customListName})
        .then(function(foundList){
            
              if(!foundList){
                const list = new List({
                  name:customListName,
                  items:defaultItems
                });
                list.save()
                .then(function() {

                  res.redirect("/" + customListName);
              
                });
              }
            
            else{
              res.render("list",{listTitle:foundList.name,newListItems:foundList.items});
            }

          })
                
    .catch(function(err){});
 
        

        
      });
      
      app.post("/", function(req, res){
      
        const itemName = req.body.newItem;
        const listName=req.body.list;
      const item=new Item({
      name:itemName
      })

      if(listName==="Today"){
        item.save();
        res.redirect("/");
      }
else{
  List.findOne({name:listName})
  .then(function(foundList){
    foundList.items.push(item);
    foundList.save();
    res.redirect("/"+listName);
            
})
.catch(function(err){});
}
      
      
      });

      app.post("/delete",function(req,res){
        // console.log(req.body.checkbox);

        const checkedItemId=req.body.checkbox;
        const listName=req.body.list;
        if(listName==="Today"){
          Item.findByIdAndRemove(checkedItemId)
          .then(function(foundItem)
          {
            Item.deleteOne({_id: checkedItemId})
          })
   
          res.redirect("/");
        }
        else{
          List.findOneAndUpdate({name:listName}, {$pull:{items:{_id: checkedItemId}}})
          .then(function(foundlist){ 
            

            res.redirect("/"+ listName);
      
          });

        }
      
       
      })
      
      app.get("/work", function(req,res){
        res.render("list", {listTitle: "Work List", newListItems: workItems});
      });
      
      app.get("/about", function(req, res){
        res.render("about");
      });
      
      app.listen(3000, function() {
        console.log("Server started on port 3000");
      });
  
  }


