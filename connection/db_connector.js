const mysql=require('promise-mysql2');
require('dotenv').config();
const response=require('../model/model')
const log =require('../logger/log')

async function createPool(){
    return mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectionLimit: process.env.POOL_SIZE
    });
}

async function openDbConnection(email){
    const start_time=process.hrtime();
    log.applicationMessage('info','openDbConnection function started execution',email,'db_connector','openDbConnection')
    try{
        const pool=await createPool();
        const connection=await pool.getConnection();
        log.applicationMessage('info','connection established',email,'db_connector','openDbConnection')
        return connection;

    }
    catch(error){
        console.error('Failed to establish a database connection');
        throw error;
    }finally{
        const execution_time = response.executionTime(start_time)
        log.applicationMessage('info', 'oprnDbConnection function ended', email, 'db_connector.js', 'openDbConnection')
        log.meteringMessage(`Execution time: ${execution_time}ms`, email, 'db_connector.js', `openDbConnection`,);
    }
}


module.exports={
    openDbConnection
};