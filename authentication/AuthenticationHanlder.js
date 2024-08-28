const jwt=require('jsonwebtoken');
const response= require('../model/model');
const log =require('../logger/log');
const config=require('../config/config.json');
const JWT_SECRET=config.JWT_SECRET

let current_user_id=null;
let current_email=null;

const generateToken=(user)=>{
    const start_time=process.hrtime();
    const email=user.email
    log.applicationMessage('info','Started execution of generateToken function',email,'AuthenticationHandler.js','generateToken')
  
    const {user_id,first_name,last_name}=user;
    try{
        current_email=email;
        current_user_id=user_id     
    const payload={
            user_id,
            first_name,
            last_name,
            email
        };
        
        return jwt.sign(payload,JWT_SECRET,{expiresIn:'1h'});
    }
    catch(error){
        res.send(response.responseHandler(false,500,`Error:${error}`))
        log.applicationMessage('error',`error:${error}`,email,'AuthenticationHandler.js','generateToken')

    }
    finally {
        const execution_time=response.executionTime(start_time);
        log.applicationMessage('info','generateToken function ended',email,'AuthenticationHandler.js','generateToken')
        log.meteringMessage(`Execution time: ${execution_time}ms`,email,'AuthenticationHandler.js','generateToken');

    }


};


const validateToken=(token)=>{
    const start_time=process.hrtime();
    log.applicationMessage('info','Started execution of validateToken function',current_email,'AuthenticationHandler.js','validateToken');
    try{
        valid_token=jwt.verify(token,JWT_SECRET); 
        return valid_token
    }
    catch(err){
            res.send(response.responseHandler(false,500,`Error:${err}`))
            log.applicationMessage('error',`error:${error}`,current_email,'AuthenticationHandler.js','validateToken')
            return null;
    }finally{
        const execution_time=response.executionTime(start_time);
        log.applicationMessage('info','validateToken function ended',current_email,'AuthenticationHandler.js','validateToken')
        log.meteringMessage(`Execution time: ${execution_time}ms`,'not-available','AuthenticationHandler.js','validateToken');

    }
};

const handleTokenValidation=async(req,res)=>{
    const start_time=process.hrtime();
    log.applicationMessage('info','Started execution of handleTokenValidation function',current_email,'AuthenticationHandler.js','handleTokenValidation');
    try{
        const auth_header=req.headers['authorization'];
        if(!auth_header){
            log.applicationMessage('error','Token is required',current_email,'AuthenticationHandler','handleTokenValidation');
            res.send(response.responseHandler(false,400,'Token is required'));
        }
        else{
            const token=auth_header.split(' ')[1];
            if(!token){
                log.applicationMessage('error','Authorization token is required',current_email,'AuthenticationHandler','handleTokenValidation');
                res.send(response.responseHandler(false,400,'Authorization token is required'));
            }else{
                const is_token_valid=validateToken(token);
                if (is_token_valid.user_id!==current_user_id){
                    log.applicationMessage('error','user mismatch for the token',current_email,'AuthenticationHandler','handleTokenValidation');
                    res.send(response.responseHandler(false,400,"user mismatch for the token"));
                    return;

                }
                
                if(!is_token_valid){
                    log.applicationMessage('error','Invalid or expired token',current_email,'AuthenticationHandler','handleTokenValidation');
                    res.send(response.responseHandler(false,400,'Invalid or expired token'));
                }else{
                    return is_token_valid;
                }
            }
        }
    } catch(error){
        if(error.name==='TokenExpiredError'){
            log.applicationMessage('error','Token expired',current_email,'AuthenticationHandler','handleTokenValidation');
            res.send(response.responseHandler(false,400,'Token expired '));
        }
        else{
            log.applicationMessage('error','Error during token validation',current_email,'AuthenticationHandler','handleTokenValidation');
            res.send(response.responseHandler(false,400,'Error during token validation'));
        }
    }finally{
        const execution_time=response.executionTime(start_time);
        log.applicationMessage('info','handleTokenValidation function ended',current_email,'AuthenticationHandler.js','handleTokenValidation')
        log.meteringMessage(`Execution time: ${execution_time}ms`,current_email,'AuthenticationHandler.js','handleTokenValidation');

    }
    
}

module.exports={
    generateToken,
    validateToken,
    handleTokenValidation
};
