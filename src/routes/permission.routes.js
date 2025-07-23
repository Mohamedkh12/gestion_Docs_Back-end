const {
    createPermissionHandler,
    getAllPermissionsHandler,
    getPermissionByIdHandler,
    updatePermissionHandler,
    deletePermissionHandler,
} = require('../presenters/permission.presenter');

async function permissionRoutes(fastify) {
    fastify.get('/getAllPermissions', getAllPermissionsHandler);
    fastify.get('/getPermissions/:id', getPermissionByIdHandler);
    fastify.post('/createPermissions', createPermissionHandler);
    fastify.put('/updatePermissions/:id', updatePermissionHandler);
    fastify.delete('/deletePermissions/:id', deletePermissionHandler);
}

module.exports = permissionRoutes;
