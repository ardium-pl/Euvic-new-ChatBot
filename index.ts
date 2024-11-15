import ansis from 'ansis';
import cors from 'cors';
import 'dotenv/config';
import express from 'express';

const PORT = process.env.PORT ?? 8080;

const app = express();

// Middleware
app.use(express.json());
app.use(cors());


// Startup
console.log(`Starting server...`);
app.listen(PORT, () => {
  console.log(`Running on port ${ansis.greenBright.underline(String(PORT))}!`);

  try {
    console.log(`Connected to database!`);
  } catch (err) {
    throw err;
  }
});