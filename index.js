import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

import connection, { dbName } from "./connection.js";

const app = express();
const port = 8001;
let db

app.use(express.json());

app.use(cors({ origin: "*" }))



const users = [
    { username: "aditya11", password: bcrypt.hashSync("1122", 10) },
    { username: "ritika11", password: bcrypt.hashSync("1122", 10) },
    { username: "kabir11", password: bcrypt.hashSync("1122", 10) },
    { username: "rahul11", password: bcrypt.hashSync("1122", 10) },
];


// Middleware to authenticate and decode JWT token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: "Token required" });

    const token = authHeader.split(" ")[1];
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: "Invalid token" });
        req.user = user; // Attach the decoded user to the request
        next();
    });
};

// Secret key for signing JWTs
const JWT_SECRET = "your_jwt_secret_key";

app.post("/api/authenticate", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required." });
    }

    // Find user by username
    const user = users.find((u) => u.username === username);

    if (!user || !bcrypt.compareSync(password, user.password)) {
        return res.status(401).json({ message: "Invalid username or password." });
    }

    // Generate a JWT token
    const token = jwt.sign({ username: user.username }, JWT_SECRET, { expiresIn: "1h" });

    res.status(200).json({ message: "Login successful!", token });
});

// Protected route
app.get("/api/protected", (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "No token provided." });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        res.status(200).json({ message: "Access granted to protected route.", user: decoded });
    } catch (error) {
        res.status(401).json({ message: "Invalid or expired token." });
    }
});



// Save expenses based on username
app.post("/expenses", authenticateToken, async (req, res) => {
    const { username } = req.user;
    console.log(username);
    const { date, description, amount } = req.body;

    if (!date || !description || !amount) {
        return res.status(400).json({ message: "All fields are required." });
    }

    let collectionName = "";
    if(username == 'aditya11'){
        collectionName = 'expenses'
    }
    else if(username == 'ritika11'){
        collectionName = 'expensesRitika'
    }
    else if(username == 'rahul11'){
        collectionName = 'expensesRahul'
    }
    else if(username == 'kabir11'){
        collectionName = 'expensesKabir'
    }


    try {
        await db.collection(collectionName).insertOne({ date, description, amount });
        res.status(200).json({ message: "Expense added successfully" });
    } catch (error) {
        res.status(500).json({ message: "Failed to save expense", error });
    }

});
app.get('/data',authenticateToken, async(req,res)=>{
    const { username } = req.user;
    console.log(username)
    let collectionName = "";
    if(username == 'aditya11'){
        collectionName = 'expenses'
    }
    else if(username == 'ritika11'){
        collectionName = 'expensesRitika'
    }
    else if(username == 'rahul11'){
        collectionName = 'expensesRahul'
    }
    else if(username == 'kabir11'){
        collectionName = 'expensesKabir'
    }

    const data = await db.collection(collectionName).find().toArray();
    res.send(data);
})

// Delete an expense based on the logged-in user
app.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const { username } = req.user;
        console.log(`Deleting expense for user: ${username}`);

        const expenseId = req.params;
        let collectionName = getCollectionName(username);

        if (!collectionName) {
            return res.status(404).send({ message: 'User not recognized.' });
        } 

        // Delete the expense document
        const result = await db.collection(collectionName).deleteOne({ _id: expenseId });

        if (result.deletedCount === 0) {
            return res.status(404).send({ message: 'Expense not found.' });
        }

        res.send({ message: 'Expense deleted successfully.' });
    } catch (error) {
        console.error('Error deleting expense:', error);
        res.status(500).send({ message: 'Error deleting expense.' });
    }
});

// Helper function to get collection name based on username
function getCollectionName(username) {
    const userCollections = {
        'aditya11': 'expenses',
        'ritika11': 'expensesRitika',
        'rahul11': 'expensesRahul',
        'kabir11': 'expensesKabir'
    };
    return userCollections[username] || null;
}

connection.then((client) => {
    db = client.db(dbName)
    app.listen(port, () => console.log(port + " started"))
})
