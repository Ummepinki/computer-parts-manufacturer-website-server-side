const express = require('express')
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();
const app = express()
const port = process.env.PORT || 5000

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.kezca.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
console.log(uri);
async function run() {
    try {
        await client.connect();
        const partsCollection = client.db('computer_parts').collection('parts');
        const bookingCollection = client.db('computer_parts').collection('bookings');
        const userCollection = client.db('computer_parts').collection('users');


        app.get('/parts', async (req, res) => {
            const query = {};
            const cursor = partsCollection.find(query);
            const parts = await cursor.toArray();
            res.send(parts);
        });

        app.put('/user/:email', async (req, res) => {
            const email = req.params.email;
            const user = req.body;
            //console.log(email, user);
            const filter = { email: email };
            const options = { upsert: true };
            const updateDoc = {
                $set: user,
            };
            const result = await userCollection.updateOne(filter, updateDoc, options);
            console.log(result);
            res.send({ result });
        });

        app.get('/parts/:id', async (req, res) => {

            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const parts = await partsCollection.findOne(query);
            console.log(parts);
            res.send(parts);
        });

        app.post('/booking', async (req, res) => {
            const booking = req.body;
            const query = { orders: booking.orders, customerEmail: booking.customerEmail };
            const exists = await bookingCollection.findOne(query);
            if (exists) {
                return res.send({ success: false, booking: exists })
            }

            const result = await bookingCollection.insertOne(booking);
            res.send({ success: true, result });
        });

        app.get('/booking', async (req, res) => {
            const customerEmail = req.query.customerEmail;
            const query = { customerEmail: customerEmail };
            const bookings = await bookingCollection.find(query).toArray();
            res.send(bookings);


        })


    }
    finally {

    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hello!')
})

app.listen(port, () => {
    console.log(` app listening on port ${port}`)
})