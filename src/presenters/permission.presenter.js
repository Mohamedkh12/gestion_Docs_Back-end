const permissionRepo = require('../repositories/permission.repository');

async function createPermissionHandler(req, reply) {
    try {
        const permission = await permissionRepo.createPermission(req.body);
        reply.code(201).send(permission);
    } catch (err) {
        reply.code(500).send({ message: err.message });
    }
}

async function getAllPermissionsHandler(req, reply) {
    try {
        const permissions = await permissionRepo.getAllPermissions();
        reply.send(permissions);
    } catch (err) {
        reply.code(500).send({ message: err.message });
    }
}

async function getPermissionByIdHandler(req, reply) {
    try {
        const permission = await permissionRepo.getPermissionById(req.params.id);
        if (!permission) return reply.code(404).send({ message: "Permission not found" });
        reply.send(permission);
    } catch (err) {
        reply.code(500).send({ message: err.message });
    }
}

async function updatePermissionHandler(req, reply) {
    try {
        const permission = await permissionRepo.updatePermission(req.params.id, req.body);
        if (!permission) return reply.code(404).send({ message: "Permission not found" });
        reply.send(permission);
    } catch (err) {
        reply.code(500).send({ message: err.message });
    }
}

async function deletePermissionHandler(req, reply) {
    try {
        const permission = await permissionRepo.deletePermission(req.params.id);
        if (!permission) return reply.code(404).send({ message: "Permission not found" });
        reply.send({ message: "Permission deleted" });
    } catch (err) {
        reply.code(500).send({ message: err.message });
    }
}

module.exports = {
    createPermissionHandler,
    getAllPermissionsHandler,
    getPermissionByIdHandler,
    updatePermissionHandler,
    deletePermissionHandler
};
