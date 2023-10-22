//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const itemSchema = {
  name: String
}

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({ name: "Welcome to your todolist !" });
const item2 = new Item({ name: "Hit the + button to add a new item" });
const item3 = new Item({ name: "<-- Hit this to delete an item." });

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemSchema]
}

const List = mongoose.model("List", listSchema);


main().catch(err => console.log(err));
async function main() {
  mongoose.connect("mongodb+srv://admin-reev:fpkQno1WHHrjuuZ6@cluster0.0llqunt.mongodb.net/todolistDB", { useNewUrlParser: true });


  //To save defaultItems to db
  // await Item.insertMany(defaultItems);



}

//Fix to the favicon entry in db issue
app.get('/favicon.ico', (req, res) => res.status(204).end());

app.get("/", async function (req, res) {

  //To display defaultItems to db
  const foundItems = await Item.find({});
  // console.log(foundItems);

  if (foundItems.length === 0) {
    // To save defaultItems to db
    await Item.insertMany(defaultItems);
    res.redirect("/");
  } else {
    res.render("list", { listTitle: "Today", newListItems: foundItems });
  }

});

app.get("/:customListName", async function (req, res) {
  const customListName = _.capitalize(req.params.customListName);
  const foundList = await List.findOne({ name: customListName }).exec();
  if (!foundList) {
    //Create a New List
    const list = new List({
      name: customListName,
      items: defaultItems
    });
    list.save();
    res.redirect("/" + customListName);
  } else {
    //Show an Existing List
    res.render("list", { listTitle: foundList.name, newListItems: foundList.items });

  }

});

app.post("/", async function (req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;


  const item = new Item({
    name: itemName
  });

  if (listName == "Today") {
    item.save();
    res.redirect("/");
  } else {
    const foundList = await List.findOne({ name: listName });
    if (foundList) {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    }
  }


});

app.post("/delete", async function (req, res) {

  console.log(req.body.listName);
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    await Item.deleteOne({ _id: checkedItemId });
    res.redirect("/");
  } else {

    await List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: checkedItemId } } });
    res.redirect("/" + listName);

    // const foundList = await List.findOne({ name: listName });
    // if (foundList) {
    //   foundList.items.push(item);
    //   foundList.save();
    //   res.redirect("/" + listName);
    // }
  }



});



app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
