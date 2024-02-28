const mysql = require('mysql2');
const faker = require('faker');
const db = require('./db');


function generateRandomData() {
  const data = [];
  const countries = ['US', 'UK', 'CA', 'AU', 'JP', 'DE', 'FR', 'IT', 'ES', 'IN']; // Example list of countries

  const currentDate = new Date();
  const lastMonthDate = new Date(currentDate.getFullYear(), currentDate.getMonth()-1, currentDate.getDate());

  for (let i = 0; i < 10000; i++) {
    const uid = faker.datatype.uuid();
    const name = faker.name.findName();
    const score = faker.datatype.number({ min: 0, max: 100 });
    const country = countries[Math.floor(Math.random() * countries.length)];
    const timestamp = faker.date.between(lastMonthDate, currentDate);
    const formattedTimestamp = timestamp.toISOString().slice(0, 19).replace('T', ' '); // Remove milliseconds and time zone offset
    data.push([uid, name, score, country, formattedTimestamp]);
  }

  return data;
}

// Insert dummy data into the database
async function insertDummyData() {
  
    try {
      const connection =await db.getConnection();
      const data = await generateRandomData();
      const query = 'INSERT INTO leaderboard (UID, Name, Score, Country, TimeStamp) VALUES ?';
      await connection.query(query, [data]);
      connection.release();
      console.log('Dummy data inserted successfully');
    } catch (error) {
      console.error('Error inserting dummy data: ', error);
    }
  }
  
  // Run the data generation process
  async function run() {

      await insertDummyData();

  }
  
  // Execute the data generation process
  run();