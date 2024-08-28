const Router=require('restify-router').Router;
const services=require('../services/service');
const response=require('../model/model');
const log = require('../logger/log');
const router=new Router();




router.post('/login',async(req,res)=>{
    const start_time=process.hrtime();
    let email;
    try{
        email=req.body.email;
        
        const result=await services.loginUser(req.body);


        res.send(result)
        const end_time=process.hrtime(start_time);
        const execution_time=(end_time[0]*1000+end_time[1]/1e6);
        log.meteringMessage(`Execution time of login api is:${execution_time}`,email,'router.js','/login')
    }catch(error){
        log.applicationMessage('error',`Error:${error}`,email,'router.js','/login')
    }
});






// router.post('/login', (req, res, next) => {
//     const start_time = process.hrtime();
//     services.loginUser(req, res, next)
//       .then((result) => {
//         const execution_time = response.executionTime(start_time);
//         log.meteringMessage(`Execution time: ${execution_time}`, result, 'router.js', '/login');
//       })
//       .catch((err) => {
//         log.applicationMessage('error',`Error at login api:${err}`,result,'router.js','/login');
//         next(err);
//       });
//   });

router.get('/displayallusers',(req,res,next)=>{
    const start_time=process.hrtime();
    services.displayAllUsers(req,res,next)
    .then((result)=>{
        const execution_time=response.executionTime(start_time);
        log.meteringMessage(`Executin time:${execution_time}`,result,'router.js','/displayallusers');
    })
    .catch((err)=>{
        log.applicationMessage('error','Error at displayallusers api',result,'router.js','/displayallusers');
        next(err);
    });
});

router.post('/createtask',(req,res,next)=>{
    const start_time=process.hrtime();
    services.createTask(req,res,next)
    .then((result)=>{
        const execution_time= response.executionTime(start_time);
        log.meteringMessage(`Executin time:${execution_time}`,result,'router.js','/createtask');

    })
    .catch((err)=>{
        log.applicationMessage('error','Error at displayallusers api',result,'router.js','/createtask');
        next(err);

        
    });
});

router.get('/displayalltasks',services.displayAllTasks);

router.post('/displaytaskbyid',services.displayTaskById);

router.post('/edittask',(req,res,next)=>{
    const start_time=process.hrtime();
    services.editTask(req,res,next)
    .then((result)=>{
        const execution_time=response.reexecutionTime(start_time);
        log.meteringMessage(`Execution rime:${execution_time}`,result,'router.js','/edittask');
    })
    .catch((err)=>{
        log.applicationMessage('error',`Error at edittask api ${err}`,result,'router.js','/edittask');
        next(err);
    });
});

router.post('/starttask',services.startTask);

router.post('/updateprogress',services.updateTaskProgress);

router.post('/assigntask',services.assignTask)

module.exports=router;