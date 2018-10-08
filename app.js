const express = require("express")
const app = express();
const bodyParser = require("body-parser");
const igdb = require('igdb-api-node').default;
require('dotenv').config()

const client = igdb(process.env.apiKey);

app.set("view engine", "ejs");
app.use(express.static('static'));
app.use(bodyParser.urlencoded({extended:true}));

app.get("/", function(req, res){
    client.games({
        limit: 10,
        fields: "*",
        order: "popularity:desc"
    })
    .then(response => {
        res.render("home", {data: response.body})
    }).catch(error => {
        throw error
    })
});

app.get("/games/:id", function(req, res){
    var gameid = req.params.id
    client.games({
        ids: [gameid],
        fields: '*'
    })
    .then(response => {
        console.log(response)
        res.render("gameSingle", {data: response.body})
    })
    .catch(error => {
        throw error
    })
})

app.listen(8000, function(){
    console.log("server running. Project available at http://localhost:8000")
})