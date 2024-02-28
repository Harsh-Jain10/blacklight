const express = require('express');
const bodyParser = require('body-parser');
const { getConnection } = require('./db');
require("dotenv").config

const app = express();
app.use(bodyParser.json());

// Middleware to handle database connection
app.use(async (req, res, next) => {
    try {
        req.dbConnection = await getConnection(); // Attach the connection to the request object
        next();
    } catch (error) {
        console.error('Error establishing database connection:', error);
        res.status(500).send('Error establishing database connection');
    }
});

// Current week leaderboard (Top 200)
app.get('/leaderboard', async (req, res) => {
    const { dbConnection } = req;
    const currentDate = new Date();
    const thisWeekStart = new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay()));
    const thisWeekEnd = new Date(currentDate.setDate(currentDate.getDate() + 6 ));

    try {
        const [rows] = await dbConnection.query(
            `SELECT UID, Name, Score, Country, TimeStamp
            FROM leaderboard
            WHERE TimeStamp >= ? AND TimeStamp <= ?
            ORDER BY Score DESC
            LIMIT 200`,
            [thisWeekStart, thisWeekEnd]
        );
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error retrieving leaderboard');
    }
});

// Last week leaderboard by country (Top 200)
app.get('/lastWeek/:country', async (req, res) => {
    const { dbConnection } = req;
    const country = req.params.country; // Convert to uppercase for ISO 2 letter code
    const currentDate = new Date();
    const lastWeekStart = new Date(currentDate.setDate(currentDate.getDate() - 7 - currentDate.getDay()));
    const lastWeekEnd = new Date(currentDate.setDate(currentDate.getDate() + 6));

    try {
        const [rows] = await dbConnection.query(
            `SELECT UID, Name, Score, Country, TimeStamp
            FROM leaderboard
            WHERE TimeStamp >= ? AND TimeStamp <= ? AND Country = ?
            ORDER BY Score DESC
            LIMIT 200`,
            [lastWeekStart, lastWeekEnd, country]
        );
        res.json(rows);
    } catch (err){
        console.error(err);
        res.status(500).send('Error retrieving leaderboard');
    }
});

// User rank by UID
app.get('/rank/:userId', async (req, res) => {
    const { dbConnection } = req;
    const userId = req.params.userId;

    try {
        const [rows] = await dbConnection.query(
            `select dense_rank() over (order by Score desc) AS 'rank' from leaderboard WHERE UID = ?`,
            [userId]
        );
        const rank = rows[0]?.rank;
        if (rank) {
            res.json({ rank });
        } else {
            res.status(404).send('User not found');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Error retrieving user rank');
    }
});

app.listen(process.env.PORT, () => {
    console.log('Server listening on port 3000');
});

