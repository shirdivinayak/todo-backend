const log=require('../logger/log')

const responseHandler=(status,statusCode,message,data=[])=>{
    try{

        return{
            status,
            statusCode,
            message,
            data

        };
    }catch(error){
        log.applicationMessage('error',`Error:${error}`);
    }    
        


}

function executionTime(start_time){
    try{

    const end_time=process.hrtime(start_time);
    const execution_time=(end_time[0]*1000+end_time[1]/1e6);
    return execution_time;
    }catch(error){
        log.applicationMessage('error',`Error:${error}`)
    }

};





module.exports={
    executionTime,
    responseHandler
}