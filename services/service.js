const dboperation = require('../connection/db_operation');
const query = require('../connection/mysql_query');
const authenticate =require('../authentication/AuthenticationHanlder');
const log =require('../logger/log');
const response = require('../model/model');

function validateFields(fields){
    try{
    for(const field of fields){
        if(!field||field.trim()===''){
            return false;
        }
    }
    return true;
}catch(error){
    res.send(response.responseHandler(false,400,`error:${error}`));
}
}

function validateDate(date){
    try{
    const dateFormat=/^\d{4}-\d{2}-\d{2}$/;
    return dateFormat.test(date);
    }catch(error){
        res.send(response.responseHandler(false,400,`Error:${error}`));
    }
}

async function loginUser(body) {
    const start_time=process.hrtime();
    let result;
    try {
        log.applicationMessage('info','loginUser function started execution','username','service.js','loginUser')
        const username=body.username;
        const password=body.password;
        if (!validateFields([username,password])) {
            result= response.responseHandler(false,400,'Username and password are required');
           log.applicationMessage('error','Username and password are required',username,'service.js','loginUser')
            return;
        }
        else{     
            const user = await dboperation.executeQuery(query.loginUser, [username, password],username);
            if(user!=null &&user!=undefined){

                if (user.length > 0) {
                    
                    const token=await authenticate.generateToken(user[0]);
                    result=response.responseHandler(true,200,'Login Successful',token);
                    log.applicationMessage('info','Login successful',username,'service.js','loginUser')
                } else {
                    result=response.responseHandler(false,400,'Invalid credentials');
                    log.applicationMessage('error','Invalid credentials',username,'service.js','loginUser')
                }
            }
        
        }

    } catch (error) {
        console.error('Error during login:', error);
        result= response.responseHandler(false,500,`Internal server error : ${error}`);
        log.applicationMessage('error','Internal server error',username,'service.js','loginUser')
    }
    finally{
        const execution_time=response.executionTime(start_time)
        log.applicationMessage('info','function ended','username','service.js','loginUser')
        log.meteringMessage(`Execution time: ${execution_time}ms`,'username','service.js','loginUser');
    
        return result;
        

    }
}

async function displayAllUsers(req, res) {
    const start_time = process.hrtime();
    let email
    try {

        const valid_token=await authenticate.handleTokenValidation(req,res);
        if(!valid_token) return;
        email=valid_token.email
        log.applicationMessage('info', 'displayAllUsers function started execution', `${email}`, 'service.js', 'displayAllUsers')
        
        const all_users = await dboperation.executeQuery(query.fetch_all_users,[],email);
        log.applicationMessage('info', 'Query Executed successfully', email, 'service.js', 'displayAllUsers');
        res.send(response.responseHandler(true,200,'Successfully executed query ' ,all_users));
   
    } 
    catch (error) {
        console.error('Error fetching users', error);
        log.applicationMessage('error', 'Error fetching user', 'not-available', 'service.js', 'displayAllUsers')
        res.send(response.responseHandler(false,500,'Error fetching user'));
    } 
    finally {
        const execution_time = response.executionTime(start_time)
        log.applicationMessage('info', 'function ended', email, 'service.js', 'displayAllUsers')
        log.meteringMessage(`Execution time: ${execution_time}ms`, email, 'service.js', `displayAllUsers`,);
        return email
    }
}

async function createTask(req, res) {
    const start_time = process.hrtime();
    let email;
    let responseObj = { success: false, statusCode: 500, message: 'Internal server error' }; 

    try {
        const valid_token = await authenticate.handleTokenValidation(req, res);
        if (!valid_token) {
            responseObj = { success: false, statusCode: 401, message: 'Invalid token' };
        } else {
            email = valid_token.email;
            const user_id = valid_token.user_id;

            log.applicationMessage('info', 'createTask function started execution', email, 'service.js', 'createTask');

            const { task_name, task_description, start_date, end_date } = req.body;

            if (!validateFields([task_name, task_description, start_date, end_date])) {
                responseObj = { success: false, statusCode: 400, message: 'Task name, description, start date, and end date cannot be empty or just spaces' };
            } else if (!validateDate(start_date) || !validateDate(end_date)) {
                responseObj = { success: false, statusCode: 400, message: 'Start date and end date must be in the format YYYY-MM-DD' };
            } else if (end_date < start_date) {
                responseObj = { success: false, statusCode: 400, message: 'End date must be after the start date' };
            } else {
                const effective_start_date = new Date().toISOString().split('T')[0];
                const task_status = 'not started';

                const queries = [
                    [query.createTask, [task_name, task_description, start_date, end_date, task_status, effective_start_date]],
                    [query.map_task, [user_id, start_date, end_date]]
                ];

                const result = await dboperation.executeTransaction(queries, email);

                if (result === 'success') {
                    responseObj = { success: true, statusCode: 200, message: 'Task created successfully' };
                } else {
                    responseObj = { success: false, statusCode: 500, message: 'Failed to create task' };
                }
            }
        }
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            responseObj = { success: false, statusCode: 409, message: 'Task name already exists' };
        } else {
            responseObj.message = 'Internal server error';
            console.error(error);
        }
        log.applicationMessage('error', responseObj.message, email, 'service.js', 'createTask');
    } finally {
        const execution_time = response.executionTime(start_time);
        log.applicationMessage('info', 'createTask function ended', email, 'service.js', 'createTask');
        log.meteringMessage(`Execution time: ${execution_time}ms`, email, 'service.js', 'createTask');

        res.send(response.responseHandler(responseObj.success, responseObj.statusCode, responseObj.message));
    }
}




async function displayAllTasks(req,res){
    const start_time=process.hrtime()
    let email
    try{
        const valid_token=await authenticate.handleTokenValidation(req,res);

        if(!valid_token) return;
        email=valid_token.email;

        log.applicationMessage('info', 'displayAllTasks function started execution', email, 'service.js', 'displayAllTasks');

        const all_tasks= await dboperation.executeQuery(query.fetch_all_tasks,email)
        
        log.applicationMessage('info', 'fetch_all_tasks query executed successfully', email, 'service.js', 'displayAllTasks');
        res.send(response.responseHandler(true,200,'All tasks fetched successfully',all_tasks))
        
    }catch(error){
        res.send(response.responseHandler(false,500,`Error:${error}`));
        log.applicationMessage('error',`Error:${error}`,email,'service.js','displayAllTasks');
    }finally{
        const execution_time=response.executionTime(start_time)
        log.applicationMessage('info','displayAllTasks ended execution',email,'service.js','displayAllTasks');
        log.meteringMessage(`Execution time: ${execution_time}`,email,'service.js','displayAllTasks')
    }
};

async function displayTaskById(req,res){
    const start_time=process.hrtime();
    let email;
    try{
        const valid_token=await authenticate.handleTokenValidation(req,res);

        if(!valid_token) return;
        email=valid_token.email;

        log.applicationMessage('info','displayTaskById started execution',email,'service.js','displayTaskByID');
        const task_id=req.body.task_id
        const task=await dboperation.executeQuery(query.fetch_task_by_id,[task_id],email);
        log.applicationMessage('info','fetch_task_by_id query executed successfully',email,'service.js','displayTaskById');
        res.send(response.responseHandler(true,200,'The task fetched successfully',task))

    }catch(error){
        res.send(response.responseHandler(false,500,`Error:${error}`));
        log.applicationMessage('error',`Error:${error}`,email,'service.js','displayTaskById');

    }finally{
        const execution_time=response.executionTime(start_time);
        log.applicationMessage('info','displayTaskById ended execution',email,'service.js','displayTaskById');
        log.meteringMessage(`Executio time: ${execution_time}`,email,'service.js','displayAllTaskById');
    }
};

async function editTask(req,res){
    const start_time=process.hrtime();
    let email
    try{
        const valid_token=await authenticate.handleTokenValidation(req,res);
        if(!valid_token) return;
        email=valid_token.email;
        log.applicationMessage('info','Started execution of editTask function',email,'service.js','editTask');

        const{task_id,task_name,task_description,start_date,end_date}=req.body;
        if(!task_id){
            res.send(response.responseHandler(false,400,'task_id is a required field'));
            return ;
        }

        const task_data=[task_name,task_description,start_date,end_date,task_id];
        const result=await dboperation.executeQuery(query.edit_task,task_data,email)
        if(result.affectedRows===0){
            res.send(response.responseHandler(false, 404, 'Task not found'));
            log.applicationMessage('error', 'Task not found', email, 'service.js', 'updateTask');
        } else if(result.changedRows===0){
            res.send(response.responseHandler(false,400,'No changes found'));
        }
        else  {
            res.send(response.responseHandler(true, 200, 'Task updated successfully'));
            log.applicationMessage('info', 'Task updated successfully', email, 'service.js', 'updateTask');
        }

    } catch (error) {
        console.error('Error updating task:', error);
        res.send(response.responseHandler(false, 500, 'Internal server error'));
        log.applicationMessage('error', 'Internal server error', email, 'service.js', 'updateTask');
    } finally {
        const execution_time = response.executionTime(start_time);
        log.applicationMessage('info', 'function ended', email, 'service.js', 'updateTask');
        log.meteringMessage(`Execution time: ${execution_time}ms`, email, 'service.js', 'updateTask');
    }
};

async function startTask(req,res) {
    const start_time=process.hrtime();
    let email;
    try{
        const valid_token=await authenticate.handleTokenValidation(req,res);
        if(!valid_token) return;
        const email=valid_token.email;
        log.applicationMessage('info','started execution of UpdateTaskProgress',email,'server.js','updateTaskProgress');

        const {task_id}=req.body;
        if(!task_id){
            res.send(response.responseHandler(false,400,'task_id cannot be empty or just space it should be a integer'));
            return;

        }
        const task_data=["In progress",task_id];



        const result=await dboperation.executeQuery(query.start_task,task_data,email);

        if(result.affectedRows===0){
            res.send(response.responseHandler('false',400,'No task found'))
        }else if(result.changedRows===0){
            res.send(response.responseHandler('false',400,'Task is alredy in progress'))
        } 
        else{
            res.send(response.responseHandler(true,200,'Task started'))
        }

    }catch(error){
        res.send(response.responseHandler(false,500,`Error: ${error}`));

    }finally{
        const execution_time = response.executionTime(start_time);
        log.applicationMessage('info', 'start task function ended', email, 'service.js', 'startTask');
        log.meteringMessage(`Execution time: ${execution_time}ms`, email, 'service.js', 'startTask');

    }

};


async function updateTaskProgress(req, res) {
    const start_time = process.hrtime();
    let email;
    let responseObj = { success: true, statusCode: 200, message: '' };

    try {
        const valid_token = await authenticate.handleTokenValidation(req, res);
        if (!valid_token) {
            responseObj = { success: false, statusCode: 400, message: 'Invalid token' };
        } else {
            email = valid_token.email;
            const user_id = valid_token.user_id;
            log.applicationMessage('info', 'updateTaskProgress started execution', email, 'service.js', 'updateTaskProgress');

            const { task_id, log_description, log_date, percentage_of_completion } = req.body;
            if (!validateFields([log_description, log_date, percentage_of_completion])) {
                responseObj = { success: false, statusCode: 400, message: 'task_id, log_description, log_date, and percentage_of_completion are required fields and cannot be empty or just spaces' };
            } else if (!validaetDate(log_date)) {
                responseObj = { success: false, statusCode: 400, message: 'log_date must be in the format YYYY-MM-DD' };
            } else {
                const currentDate = new Date().toISOString().split('T')[0];
                const task_details = await dboperation.executeQuery(query.fetch_task_by_id, [task_id]);

                if (task_details.length === 0) {
                    responseObj = { success: false, statusCode: 400, message: 'Task not found' };
                } else {
                    const { task_status, effective_end_date } = task_details[0];
                    if (task_status !== 'In progress') {
                        responseObj = { success: false, statusCode: 400, message: 'Task not yet started or already completed' };
                    } else if (effective_end_date !== null) {
                        responseObj = { success: false, statusCode: 400, message: 'Task already completed' };
                    } else {
                        const log_percentage = await dboperation.executeQuery(query.get_log_percentage, [task_id]);
                        const total_logged_percentage = log_percentage[0]?.total_log_percentage || 0;

                        if (total_logged_percentage + percentage_of_completion > 100) {
                            responseObj = { success: false, statusCode: 400, message: 'Total percentage cannot be more than 100' };
                        } else {
                            let queries;
                            if (total_logged_percentage + percentage_of_completion === 100) {
                                queries = [
                                    [query.update_task_progress, [task_id, user_id, log_description, log_date, percentage_of_completion, currentDate]],
                                    [query.update_task_status, ['completed', currentDate, task_id]],
                                    [query.update_task_log_end_date, [currentDate, task_id]],
                                    [query.update_user_task_end_date, [currentDate, task_id]]
                                ];
                            } else {
                                queries = [[query.update_task_progress, [task_id, user_id, log_description, log_date, percentage_of_completion, currentDate]]];
                            }

                            const result = await dboperation.executeTransaction(queries, email);
                            responseObj = result === 'success'
                                ? { success: true, statusCode: 200, message: total_logged_percentage + percentage_of_completion === 100 ? 'Task completed successfully' : 'Task log updated successfully' }
                                : { success: false, statusCode: 400, message: 'Operation failed' };
                        }
                    }
                }
            }
        }

    } catch (error) {
        responseObj = { success: false, statusCode: 500, message: 'Internal Server Error' };
        log.applicationMessage('error', `Error: ${error.message}`, email, 'service.js', 'updateTaskProgress');
    } finally {
        res.send(response.responseHandler(responseObj.success, responseObj.statusCode, responseObj.message));
        log.applicationMessage(responseObj.success ? 'info' : 'error', responseObj.message, email, 'service.js', 'updateTaskProgress');
        const execution_time = response.executionTime(start_time);
        log.meteringMessage(`Execution time: ${execution_time}ms`, email, 'service.js', 'updateTaskProgress');
    }
};


async function assignTask(req,res){
    const start_time=process.hrtime();
    let email;
    try{
        const valid_token=await authenticate.handleTokenValidation(req,res);
        if(!valid_token) return;
        const email=valid_token.email;
        log.applicationMessage('info','Started execution assignTask',email,'service.js','assignTask');

        const {task_id,user_id}=req.body;

        result=await dboperation.executeQuery(query.assign_task,[user_id,task_id])
        if(result.affectedRows===0){
            res.send(response.responseHandler('false',400,'task_id does not exists'))

        }else{
            res.send(response.responseHandler(true,200,'Assigned sucessfully',result));

        }
    }catch(error){
            log.applicationMessage('error',`error:${error}`);
        }


    }


module.exports = {
    loginUser,
    createTask,
    displayAllUsers,
    displayAllTasks,
    displayTaskById,
    editTask,
    startTask,
    updateTaskProgress,
    assignTask
};
