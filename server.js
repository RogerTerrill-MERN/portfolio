const express = require('express');
const mongoose = require('mongoose');

const app = express();

// DB Config
const db = require('./config/keys').mongoURI;

// Connect to MongoDB with Mongoose
mongoose
    .connect(db, { useNewUrlParser: true} )
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));

app.get('/', (request, response) => response.send('Hello1'));

// process.env.Port is for Heroku and 5000 is for localhost
const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server running on port ${port}`));