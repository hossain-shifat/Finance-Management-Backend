const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const cors = require('cors');
const app = express()
const admin = require("firebase-admin");
const port = process.env.PORT || 3000



const serviceAccount = require("./fin-ease-firebase-adminsdk.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});


// middlewere
app.use(cors())
app.use(express.json())


const verifyFirebaseToken = async (req, res, next) => {
    if (!req.headers.authorization) {
        return res.status(401).send('unauthoized access')
    }
    const token = req.headers.authorization.split(' ')[1]
    if (!token) {
        return res.status(401).send({ message: 'unauthoized access' })
    }

    try {
        const userInfo = await admin.auth().verifyIdToken(token)
        req.token_email = userInfo.email;
        next()
    } catch {
        return res.status(401).send({ message: 'unauthoized access' })
    }
}


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
        app.get("/transaction", verifyFirebaseToken, async (req, res) => {
            console.log(req.headers)
            const email = req.query.email

            if (email !== req.token_email) {
                return res.status(403).send({ message: 'forbidden access' });
            }

            const query = {}
            if (email) {
                query.user_email = email
            }
            const cursor = transactionCollection.find(query)
            const result = await cursor.toArray()
            res.send(result)
        })

        // overview (in home route)
        app.get("/overview", verifyFirebaseToken, async (req, res) => {
            const email = req.query.email

            if (email !== req.token_email) {
                return res.status(403).send({ message: 'forbidden access' });
            }

            const query = {}
            if (email) {
                query.user_email = email
            }
            const cursor = transactionCollection.find(query)
            const result = await cursor.toArray()
            res.send(result)
        })

        // update transaction (my transaction route)
        app.patch('/my-transaction/:id', verifyFirebaseToken, async (req, res) => {
            const id = req.params.id
            const updateTransaction = req.body
            const query = { _id: new ObjectId(id) }
            const update = {
                $set: updateTransaction
            }
            const result = await transactionCollection.updateOne(query, update)
            res.send(result)
        })

        //  get transaction by id (transaction details route)
        app.get('/my-transaction/:id', verifyFirebaseToken, async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await transactionCollection.findOne(query)
            res.send(result)
        })

        // delete transaction (my transaction route)
        app.delete('/my-transaction/:id', verifyFirebaseToken, async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await transactionCollection.deleteOne(query)
            res.send(result)
        })


        // get transactions (in my route)
        app.get("/my-transaction", verifyFirebaseToken, async (req, res) => {
            const email = req.query.email

            if (email !== req.token_email) {
                return res.status(403).send({ message: 'forbidden access' });
            }

            const query = {}
            if (email) {
                query.user_email = email
            }
            const cursor = transactionCollection.find(query).sort({ date: -1, time: -1 })
            const result = await cursor.toArray()
            res.send(result)
        })


        //create items (add transactions)
        app.post("/add-transaction", verifyFirebaseToken, async (req, res) => {
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
