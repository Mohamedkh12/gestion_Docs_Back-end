const Role = require('../models/role.model');

async function createRole(data) {
    return await Role.create(data);
}

async function getAllRoles() {
    return await Role.find().populate('permissions');
}

async function getRoleById(id) {
    return await Role.findById(id).populate('permissions');
}

async function findRoleByName(name) {
    return await Role.findOne({ name }).populate('permissions');
}

async function updateRole(id, data) {
    return await Role.findByIdAndUpdate(id, data, { new: true }).populate('permissions');
}

async function deleteRole(id) {
    return await Role.findByIdAndDelete(id);
}

module.exports = {
    createRole,
    getAllRoles,
    getRoleById,
    findRoleByName,
    updateRole,
    deleteRole,
};
