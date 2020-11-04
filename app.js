//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const app = express();
const _ =require("lodash");

// var items=["Buy Food","Cook Food","Eat Food"];
// let workitems=[];


app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB", { useNewUrlParser: true, useUnifiedTopology: true,useFindAndModify: false });

const itemSchema = {
    name: String
};

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
    name: "Welcome to your todoList"
});

const item2 = new Item({
    name: "Hit this button !"
});

const defaultItems = [item1, item2];

const listSchema = {
    name: String,
    items: [itemSchema]
};

const List = mongoose.model("List", listSchema);


app.get("/", function (req, res) {

    // var today_date=new Date();

    // var options ={
    //     weekday: "long",
    //     day: "numeric",
    //     month:"long"
    // };

    // var today_day=today_date.toLocaleDateString("en-US",options);
    Item.find({}, function (err, foundItems) {

        if (foundItems.length === 0) {
            Item.insertMany(defaultItems, function (err) {
                if (err) {
                    console.log("Error");
                } else {
                    console.log("SUccess!");
                }
            });
            res.redirect("/");
        } else {
            res.render("list", {
                listTitle: "Today",
                newListItem: foundItems
            });
        }
    })


});

app.get("/:customListName", function (req, res) {
    const customListName = _.capitalize(req.params.customListName);


    List.findOne({ name: customListName }, function (err, foundList) {
        if (!err) {
            if (!foundList) {
                const list = new List({
                    name: customListName,
                    items: defaultItems
                });

                list.save();
                res.redirect("/"+customListName);
            }
            else {
                res.render("list", {
                    listTitle: foundList.name,
                    newListItem: foundList.items
                });
            }
        }
    })

});

app.post("/", function (req, res) {

    let itemName = req.body.newItem;
    const listName=req.body.list;

    // if(req.body.list === "Work")
    // {
    //     workitems.push(item);
    //     res.redirect("/work");
    // }
    // else
    // {
    //     items.push(item);
    //     res.redirect("/");
    // }
    const item = new Item({
        name: itemName
    });

    if(listName=== "Today"){
    item.save();
    res.redirect("/");
    }
    else{
        List.findOne({name: listName},function(err, foundList){
            foundList.items.push(item);
            foundList.save();
            res.redirect("/"+listName);
        })
    }
});

app.post("/delete", function (req, res) {
    const checkedItemId = req.body.checkbox;
    const listName=req.body.listName;

    if(listName=== "Today"){

    Item.findByIdAndRemove(checkedItemId, function (err) {
        if (!err) {
            res.redirect("/");
        }
    });
    }
    else{
        List.findOneAndUpdate({name : listName},{$pull :{items: {_id:checkedItemId}}},function(err,foundList){
            if(!err)
            {
                res.redirect("/"+listName);
            }
        })
    }
})


// app.get("/work",function(req,res){
//     res.render("list",{
//         listTitle: "Work List",
//         newListItem: workitems
//     });
// });

// app.post("/work",function(req,res){
//     let item=req.body.newItem;
//     workitems.push(item);
//     res.redirect("/work");
// })

app.listen(3000, function () {
    console.log("Server is running on port 3000");
})