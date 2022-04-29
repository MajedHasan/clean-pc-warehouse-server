const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
require("dotenv").config();
const app = express()
const port = process.env.PORT || 5000


// Middle Ware
app.use(cors())
app.use(express.json())


// Routes
app.get('/', (req, res) => {
    res.send("Server is Running")
})


app.listen(port, () => {
    console.log("Server is Running");
})