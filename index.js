const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');
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


        app.get("/transaction", async (req, res) => {
            try {
                const cursor = transactionCollection.find();
                const result = await cursor.toArray();
                res.send(result);
            } catch (error) {
                console.error("Error fetching transactions:", error);
                res.status(500).send({ error: "Failed to fetch transactions" });
            }
        });

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


        //create items (my transactions)
        app.post("/transaction", async (req, res) => {
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
