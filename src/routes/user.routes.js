const {handleRegister,handleLogin, getUserHandle,logoutUser}=require("../presenters/user.presenter")
const authenticate = require('../middleware/authenticate')

const userRoutes=async (fastify)=>{
    fastify.post("/register",handleRegister);
    fastify.post("/login", handleLogin);
    fastify.get("/getUser", { preValidation: [authenticate] }, getUserHandle);
    fastify.post("/logout", { preValidation: [authenticate] }, logoutUser);

}

module.exports = userRoutes;
