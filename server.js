const express = require('express');

const app = express();

app.get('/', (request, response) => response.send('Hello1'));

// process.env.Port is for Heroku and 5000 is for localhost
const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server running on port ${port}`));