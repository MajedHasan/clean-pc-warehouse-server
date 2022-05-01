const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require("dotenv").config();
const app = express()
const jwt = require('jsonwebtoken')
const port = process.env.PORT || 5000


// Middle Ware
app.use(cors())
app.use(express.json())



// MongoDB
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.amk0y.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run() {
    try {
        await client.connect()
        const inventoryCollection = client.db("pHeroAssignment11").collection("inventory")

        // AUTH
        app.post("/login", async (req, res) => {
            const user = req.body
            const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: "1d"
            })
            res.send({ accessToken })
        })

        app.get('/inventory', async (req, res) => {
            const query = {}
            const cursor = inventoryCollection.find(query)
            const inventory = await cursor.toArray()
            res.send(inventory)
        })

        app.post('/inventory', async (req, res) => {
            const newInventory = req.body
            const result = await inventoryCollection.insertOne(newInventory)
            console.log(result);
            res.send(result)
        })

    }
    finally {

    }


}
run().catch(console.dir)




// Routes
app.get('/', (req, res) => {
    res.send("Server is Running")
})


app.listen(port, console.log(`Server is listening on PORT: ${port}`))