/*
Store all needed query in a variable.

*/


const loginUser='SELECT * FROM user_table WHERE username=? AND password=?';

const createTask='INSERT INTO task_table(task_name,task_description,start_date,end_date,task_status,effective_start_date) VALUES(?,?,?,?,?,?)';

const map_task='INSERT INTO user_task_mapping (user_id, task_id) VALUES (?, LAST_INSERT_ID())';

const fetch_all_tasks='SELECT * FROM task_table';

const fetch_task_by_id='SELECT * FROM task_table WHERE task_id = ? ';

const fetch_all_users='SELECT user_id,first_name,last_name,email FROM user_table';

const edit_task=`UPDATE task_table
                    SET task_name=?,task_description=?,start_date=?,end_date=?
                    WHERE task_id=?;`;

const update_task_progress=`INSERT INTO log_table (task_id,user_id,log_description,log_date,percentage_of_completion,effective_start_date) VALUES(?,?,?,?,?,?)`;

const start_task='UPDATE task_table SET task_status=? WHERE task_id=?';

const update_task_status='UPDATE task_table SET task_status=?,effective_end_date=? WHERE task_id=?';

const update_task_log_end_date='UPDATE log_table SET effective_end_date=? WHERE task_id=?';

const update_user_task_end_date='UPDATE user_task_mapping SET effective_end_date=? WHERE task_id=?';

const get_log_percentage='SELECT SUM(percentage_of_completion) AS total_log_percentage FROM log_table WHERE task_id=?';

const assign_task='UPDATE user_task_mapping SET user_id=? WHERE task_id=?'

module.exports={
    loginUser,
    fetch_all_users,
    createTask,
    map_task,
    fetch_all_tasks,
    fetch_task_by_id,
    edit_task,
    start_task,
    update_task_progress,
    update_task_status,
    update_task_log_end_date,
    update_user_task_end_date,
    get_log_percentage,
    assign_task
    };