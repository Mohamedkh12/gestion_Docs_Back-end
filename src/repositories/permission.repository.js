const Permission = require('../models/permission.model');

async function createPermission(data) {
    return await Permission.create(data);
}

async function getAllPermissions() {
    return await Permission.find();
}

async function getPermissionById(id) {
    return await Permission.findById(id);
}

async function findPermissionByName(name) {
    return await Permission.findOne({ name });
}

async function updatePermission(id, data) {
    return await Permission.findByIdAndUpdate(id, data, { new: true });
}

async function deletePermission(id) {
    return await Permission.findByIdAndDelete(id);
}

module.exports = {
    createPermission,
    getAllPermissions,
    getPermissionById,
    findPermissionByName,
    updatePermission,
    deletePermission,
};
