"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { PORT } = require('../process.env');
const express = require('express');
// Create an instance of Express
const app = express();
//Firebase admin
const admin = require('firebase-admin');
const credentials = require('../serviceAccountKey.json');
admin.initializeApp({
    credential: admin.credential.cert(credentials)
});
// Define a port number
const port = PORT || 3000;
// Middleware to parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
function isFirebaseAuthError(error) {
    return true;
}
// Define a basic route
app.get('/', (req, res) => {
    res.send('Hello, WoRLD');
});
// Define default api route
app.get('/api', (req, res) => {
    res.json({ message: 'Welcome to the API!' });
});
// Signup post request
app.post('/signup', async (req, res) => {
    try {
        const userResponse = await admin.auth().createUser({
            email: req.body.email,
            password: req.body.password,
            disabled: false
        });
        res.json(userResponse);
    }
    catch (e) {
        if (isFirebaseAuthError(e)) {
            res.status(500).json({ error: e.message });
        }
        else {
            // Handle other types of errors
            console.log(typeof e);
            res.status(500).json({ error: 'An unexpected error occurred' });
        }
    }
});
app.post('/signin', async (req, res) => {
    // Work in Progress
});
// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
