const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
dotenv.config();

const app = express();

app.get('/', (req, res) => {
    res.send('Home Page');
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
    console.log(`Server is listening on ${PORT}`);
});