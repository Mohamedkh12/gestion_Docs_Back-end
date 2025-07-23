const {
    createRoleHandler,
    getAllRolesHandler,
    getRoleByIdHandler,
    updateRoleHandler,
    deleteRoleHandler,
} = require('../presenters/role.presenter');

async function roleRoutes(fastify) {
    fastify.get('/getAllRoles', getAllRolesHandler);
    fastify.get('/getRoles/:id', getRoleByIdHandler);
    fastify.post('/createRoles', createRoleHandler);
    fastify.put('/updateRoles/:id', updateRoleHandler);
    fastify.delete('/deleteRoles/:id', deleteRoleHandler);
}

module.exports = roleRoutes;
