const roleRepo = require('../repositories/role.repository');

async function createRoleHandler(req, reply) {
    try {
        const role = await roleRepo.createRole(req.body);
        reply.code(201).send(role);
    } catch (err) {
        reply.code(500).send({ message: err.message });
    }
}

async function getAllRolesHandler(req, reply) {
    try {
        const roles = await roleRepo.getAllRoles();
        reply.send(roles);
    } catch (err) {
        reply.code(500).send({ message: err.message });
    }
}

async function getRoleByIdHandler(req, reply) {
    try {
        const role = await roleRepo.getRoleById(req.params.id);
        if (!role) return reply.code(404).send({ message: "Role not found" });
        reply.send(role);
    } catch (err) {
        reply.code(500).send({ message: err.message });
    }
}

async function updateRoleHandler(req, reply) {
    try {
        const role = await roleRepo.updateRole(req.params.id, req.body);
        if (!role) return reply.code(404).send({ message: "Role not found" });
        reply.send(role);
    } catch (err) {
        reply.code(500).send({ message: err.message });
    }
}

async function deleteRoleHandler(req, reply) {
    try {
        const role = await roleRepo.deleteRole(req.params.id);
        if (!role) return reply.code(404).send({ message: "Role not found" });
        reply.send({ message: "Role deleted" });
    } catch (err) {
        reply.code(500).send({ message: err.message });
    }
}

module.exports = {
    createRoleHandler,
    getAllRolesHandler,
    getRoleByIdHandler,
    updateRoleHandler,
    deleteRoleHandler
};
