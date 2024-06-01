const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const userRoute = require('./routes/user.route');
const errorHandler = require('./middlewares/error.middleware');
dotenv.config();

const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(cors());

// Routes
app.use('/api/v1/users', userRoute);

app.get('/', (req, res) => {
    res.send('Home Page');
});

// Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5001;

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server is listening on ${PORT}`);
    })
})
.catch((err) => console.log(err));;