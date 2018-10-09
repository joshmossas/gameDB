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
    res.render("home")
});

app.get("/games", function(req,res) {
        let sort = 'popularity:desc'
        let page = 1
        let offset = 0
        if(req.query.sort) {
            sort = req.query.sort
        }
        if(req.query.page) {
            page = req.query.page - 1
            offset = 50 * page
        }
        client.games({
            limit: 50,
            offset: offset,
            order: sort,
            fields: ["name", "id", "cover", "aggregated_rating", "rating", "genres"],
        })
        .then(response => {
            res.render("gameList", {data: response})
        })
        .catch(error => {
            throw error
        })
})

app.get("/games/search", function(req, res){
    let search = req.query.query
    let sort = req.query.sort
    let page = req.query.page
    let pageNum = 1
    let settings = {limit: 20, offset: 0, fields: '*'}
    if(search) {
        settings.search = search
    }
    if(sort) {
        settings.order = sort
    }
    if(page) {
        let pageCalc = Number(page) - 1
        pageNum = page
        settings.offset = 20 * pageCalc
    }
    client.games(settings)
    .then(response => {
        res.render("search", {data: response, searchQuery: search, sortOrder: sort, offset: settings.offset, page: pageNum})
    })
    .catch(error => {
        throw error
    })
})

app.get("/games/:id", function(req, res){
    var gameid = req.params.id
    client.games({
        ids: [gameid],
        fields: '*'
    })
    .then(response => {
        let genres = response.body[0].genres
        let genreData
        let data = response.body[0]
        if (genres) {
            client.genres({
                ids: genres,
                fields: ["name", "id"]
            })
            .then(response => {
                genreData = response.body
                res.render("gameSingle", {data: data, genres: genreData})
            })
            .catch(error => {
                throw error
            })    
        }
        else {
            res.render("gameSingle", {data: data, genres: ''})
        }
        
    })
    .catch(error => {
        throw error
    })
})

app.listen(8000, function(){
    console.log("Server running.\nView project at http://localhost:8000")
})