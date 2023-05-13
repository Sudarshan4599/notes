//jshint esversion:6

const express = require("express")
const bodyParser = require("body-parser")
const mongoose = require("mongoose")
const _ = require("lodash")


const app = express()
app.set("view engine", "ejs")
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static("public"))




async function main() {
    await mongoose.connect('mongodb+srv://sudarshantri1994:iamgod123@cluster0.v8znifs.mongodb.net/todolist?retryWrites=true&w=majority');
}

main().catch(err => console.log(err));



const itemsSchema = new mongoose.Schema({
    name: String
})


const Item = mongoose.model("Item", itemsSchema)

const item1 = new Item({
    name: "Wake Up (5'0 Clock)"
})

const item2 = new Item({
    name: "Fresh Up (5AM - 5:45AM)"
})

const item3 = new Item({
    name: "Yoga (5:45AM - 6:15AM)"
})

const defaultItems = [item1, item2, item3]

const listSchema = {
    name: String,
    items: [itemsSchema]
}

const List = mongoose.model("List", listSchema)



app.get("/", function (req, res) {

    Item.find({})

        .then((foundItems) => {

            if (foundItems.length === 0) {
                Item.insertMany(defaultItems)
                    .then(() => {
                        console.log('Users saved to MongoDB...');
                    })
                    .catch((error) => {
                        console.error(error);
                    });
                res.redirect("/")

            } else {
                res.render("list", { listTitle: "Today", newListItems: foundItems })
            }

        })

        .catch((error) => {
            console.error(error);
        });


})


app.get("/:customListName", function (req, res) {
    const customListName = _.capitalize(req.params.customListName)

    List.findOne({ name: customListName })

        .then((foundList) => {
            if(!foundList){
            const list = new List({
                name: customListName,
                items: defaultItems
            })

            list.save()
            res.redirect("/" + customListName)
        } else {
            res.render("list", {listTitle: foundList.name, newListItems: foundList.items } )
        }
    })

        .catch((error) => {
            console.log(error)
        })
})




app.post("/", function (req, res) {

    const itemName = req.body.newItem
    const listName = req.body.list

    const item = new Item({
        name: itemName
    })

    if(listName === "Today"){
        item.save()
        res.redirect("/")
    }else {
        List.findOne({name: listName})

        .then((foundList) => {
            foundList.items.push(item)
            foundList.save()
            res.redirect("/" + listName)
        })

        .catch((error) => {
            console.error(error);
        });
    }

})


app.post("/delete", function (req, res) {
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName


    if(listName === "Today"){
        Item.findByIdAndRemove(checkedItemId)
        .then(() => {
            // console.log("Successfully Deleted");
        })
        .catch((error) => {
            console.error(error);
        });

    res.redirect("/")
    } else {
        List.findOneAndUpdate({name : listName}, {$pull: {items: {_id: checkedItemId}}})
        .then((foundList) => {
            res.redirect("/" + listName)
        })
        .catch((error) => {
            console.error(error);
        });



    }
})





app.listen(3000, function () {
    console.log("Server is running on 3000")
})