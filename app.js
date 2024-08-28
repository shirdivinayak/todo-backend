const restify=require("restify")
const router=require("./router/router")
require("dotenv").config()
const port=process.env.port


const server=restify.createServer({
    name:'restify_start'

});


server.use(restify.plugins.bodyParser());
server.use(restify.plugins.queryParser());

router.applyRoutes(server);



server.listen(port,()=>{
    console.info(`Server started at port ${port}`)
})

