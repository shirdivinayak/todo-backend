const connect = require('./db_connector');
const log = require('../logger/log');
const response = require('../model/model');

async function executeQuery(query, params = [], email) {
    const start_time = process.hrtime();
    log.applicationMessage('info', 'Started execution of executeQuery function', email, 'db_operation.js', 'executeQuery');
    let connection;
    try {
        connection = await connect.openDbConnection(email);
        const [rows] = await connection.query(query, params);
        return rows;
    } catch (error) {
        log.applicationMessage('error', `error:${error}`, email, 'db_operation.js', 'executeQuery');
        console.error('Error executing query:', error);
    } finally {
        const execution_time = response.executionTime(start_time);
        log.applicationMessage('info', 'executeQuery function ended', email, 'db_operation.js', 'executeQuery');
        log.meteringMessage(`Execution time: ${execution_time}ms`, email, 'db_operation.js', 'executeQuery');
        if (connection) {
            connection.release();
        }
    }
}

async function executeTransaction(queries = [], email) {
    const start_time = process.hrtime();
    log.applicationMessage('info', 'Started execution of executeTransaction function', email, 'db_operation.js', 'executeTransaction');
    let connection;
    try {
        connection = await connect.openDbConnection(email);
        await connection.beginTransaction();

        for (const [sql, params] of queries) {
            await connection.query(sql, params);
        }

        await connection.commit();
        log.applicationMessage('info', 'Transaction committed successfully', email, 'db_operation.js', 'executeTransaction');
        return 'success';
    } catch (error) {
        if (connection) {
            await connection.rollback();
            log.applicationMessage('error', `Transaction rolled back due to error: ${error}`, email, 'db_operation.js', 'executeTransaction');
        }
        console.error('Error executing transaction:', error);
        throw error;
    } finally {
        if (connection) {
            connection.release();
        }
        const execution_time = response.executionTime(start_time);
        log.applicationMessage('info', 'executeTransaction function ended', email, 'db_operation.js', 'executeTransaction');
        log.meteringMessage(`Execution time: ${execution_time}ms`, email, 'db_operation.js', 'executeTransaction');
    }
}

module.exports = {
    executeQuery,
    executeTransaction
};
