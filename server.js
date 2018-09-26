const express = require('express');
const mongoose = require('mongoose');

const users = require('./routes/api/users');
const profile = require('./routes/api/profile');
const posts = require('./routes/api/posts');

const app = express();

// DB Config
const db = require('./config/keys').mongoURI;

// Connect to MongoDB with Mongoose
mongoose
    .connect(db, { useNewUrlParser: true} )
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));

app.get('/', (request, response) => response.send('Hello1'));

// Use Routes
app.use('/api/users', users);
app.use('/api/profile', profile);
app.use('/api/posts', posts);

// process.env.Port is for Heroku and 5000 is for localhost
const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server running on port ${port}`));