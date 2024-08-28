const mysql=require('mysql2/promise');
require('dotenv').config();

(async()=>{
    const connection=await mysql.createConnection({
        host:process.env.DB_HOST,
        user:process.env.DB_USER,
        password:process.env.DB_PASSWORD
    });
    try{
        await connection.query('CREATE DATABASE IF NOT EXISTS `taskdatabase`');

        await connection.query(`USE taskdatabase`);

        const createUserTableQuery=`
        CREATE TABLE IF NOT EXISTS user_task_mapping(
        task_id INT,
        user_id INT ,
        effective_start_date DATE,
        effective_end_date DATE,
        FOREIGN KEY(task_id) REFERENCES task_table(task_id));`;
        
        await connection.query(createUserTableQuery);
        console.log("Database and table created succefully");

    }
    catch(error){
        console.error("Error creating database or table:",error);
    }
    finally{
        await connection.end()
    }
})();




// const mysql = require('promise-mysql');

// let pool;

// async function createPool() {
//   if (!pool) {
//     pool = mysql.createPool({
//       host: 'localhost',
//       user: 'root',
//       password: 'root',
//       database: 'taskdatabase',
//       connectionLimit: 10 // You can adjust the connection limit as per your requirements
//     });
//   }
//   return pool;
// }

// async function openDbConnection() {
//   try {
//     const dbPool = await createPool();
//     const connection = await dbPool.getConnection();
//     console.log(`Connected to the database`);
//     return connection;
//   } catch (error) {
//     console.error(`Error connecting to the database: ${error}`);
//     throw error;
//   }
// }

// (async () => {
//   await openDbConnection();
// })();