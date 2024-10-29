import express from "express";
import cors from "cors";

import connection, { dbName } from "./connection.js";

const app = express();
const port = 8001;
let db

app.use(express.json());

app.use(cors({ origin: "*" }))


app.post('/expenses', (req, res) => {
    const { date, description, amount } = req.body;
    console.log('Received data:', { date, description, amount });

    // Here, you can process or save the data to a database
    db.collection('expenses').insertOne({date, description, amount})
    
    res.status(200).json({ message: 'Expense added successfully' });
});
app.get('/data', async(req,res)=>{
    const data = await db.collection('expenses').find().toArray();
    res.send(data);
})

connection.then((client) => {
    db = client.db(dbName)
    app.listen(port, () => console.log(port + " started"))
})
