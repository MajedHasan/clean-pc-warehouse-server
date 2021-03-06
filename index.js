const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require("dotenv").config();
const app = express()
const jwt = require('jsonwebtoken')
const port = process.env.PORT || 5000


// Middle Ware
app.use(cors())
app.use(express.json())


// Verify JWT
function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization
    if (!authHeader) {
        return res.status(401).send({ message: 'unauthorized access' })
    }
    const token = authHeader.split(' ')[1]
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).send({ message: 'Forbidden Access' })
        }
        req.decoded = decoded
        next()
    })
}



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

        app.get('/myitem', verifyJWT, async (req, res) => {
            const decodedEmail = req.decoded.email
            if (decodedEmail) {
                const email = req.query.email
                const query = { email }
                const cursor = inventoryCollection.find(query)
                const myItem = await cursor.toArray()
                res.send(myItem)
            }
            else {
                res.status(403).send({ message: 'Forbidden Access' })
            }
        })

        app.delete('/deleteitem/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const result = inventoryCollection.deleteOne(query)
            res.send(result)
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
            if (!result) {
                return res.send("Sorry something went wrong to adding New Item. Please try again later")
            }
            res.send(result)
        })

        app.get('/inventory/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const result = await inventoryCollection.findOne(query)
            res.send(result)
        })

        app.put('/inventory/:id', async (req, res) => {
            const id = req.params.id
            const updateQuantity = req.body.newQuantity

            const filter = { _id: ObjectId(id) }
            const options = { upsert: true }
            const updateDoc = {
                $set: {
                    quantity: updateQuantity
                }
            }
            const result = await inventoryCollection.updateOne(filter, updateDoc, options)
            res.send(result)
            console.log(id, updateQuantity);
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