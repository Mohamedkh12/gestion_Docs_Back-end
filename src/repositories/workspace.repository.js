const Workspace = require("../models/workspace.model");

async function createWorkspace(data) {
    return await Workspace.create(data);
}

async function addMemberToWorkspace(workspaceId, userId, roleId) {
    return await Workspace.findByIdAndUpdate(
        workspaceId,
        { $addToSet: { members: { user: userId, role: roleId } } },
        { new: true }
    );
}

async function getWorkspaceById(id) {
    return await Workspace.findById(id).populate("members.user members.role");
}

async function findUserWorkspace(userId, workspaceId) {
    return await Workspace.findOne({
        _id: workspaceId,
        "members.user": userId
    });
}

async function getUserWorkspaces(userId) {
    return await Workspace.find({
        $or: [
            { owner: userId },
            { "members.user": userId }
        ]
    }).populate("members.user members.role");
}

module.exports = {
    createWorkspace,
    addMemberToWorkspace,
    getWorkspaceById,
    findUserWorkspace,
    getUserWorkspaces
};
