
import * as dotenv from 'dotenv';
dotenv.config();
import app from './src/app';
import db from './src/db';


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
     console.log(`Connected to DB: ${process.env.DB_NAME} on ${process.env.DB_HOST}:${process.env.DB_PORT}`);
});