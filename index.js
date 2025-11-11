const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const cors = require('cors');
const app = express()
const port = process.env.PORT || 3000


// middlewere
app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.pbqwzvg.mongodb.net/?appName=Cluster0`;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});


app.get('/', (req, res) => {
    res.send("smart server is running")
})


async function run() {
    try {
        await client.connect()

        const db = client.db('fin_ease_db')
        const transactionCollection = db.collection('transactions')

        //get all transaction
        app.get("/transaction", async (req, res) => {
            const email = req.query.email
            const query = {}
            if (email) {
                query.user_email = email
            }
            const cursor = transactionCollection.find(query)
            const result = await cursor.toArray()
            res.send(result)
        })

        // overview (in home route)
        app.get("/overview", async (req, res) => {
            const email = req.query.email
            const query = {}
            if (email) {
                query.user_email = email
            }
            const cursor = transactionCollection.find(query)
            const result = await cursor.toArray()
            res.send(result)
        })

        // update transaction (my transaction route)
        app.patch('/my-transaction/:id', async (req, res) => {
            const id = req.params.id
            const updateTransaction = req.body
            const query = { _id: new ObjectId(id) }
            const update = {
                $set: updateTransaction
            }
            const result = await transactionCollection.updateOne(query, update)
            res.send(result)
        })

        //  get transaction by id (my transaction route)
        app.get('/my-transaction/:id',async (req,res) => {
            const id = req.params.id
            const query = {_id: new ObjectId(id)}
            const result = await transactionCollection.findOne(query)
            res.send(result)
        })

        // delete transaction (my transaction route)
        app.delete('/my-transaction/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await transactionCollection.deleteOne(query)
            res.send(result)
        })


        // get transaction (in my route)
        app.get("/my-transaction", async (req, res) => {
            const email = req.query.email
            const query = {}
            if (email) {
                query.user_email = email
            }
            const cursor = transactionCollection.find(query).sort({ date: 1 })
            const result = await cursor.toArray()
            res.send(result)
        })


        //create items (add transactions)
        app.post("/add-transaction", async (req, res) => {
            const newProduct = req.body
            const result = await transactionCollection.insertOne(newProduct)
            res.send(result)
        })


    } finally {

    }
}


run().catch(console.dir)

app.listen(port, () => {
    console.log(`smart server is running on http://localhost:${port}`)
})
