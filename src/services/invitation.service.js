const Workspace = require("../models/workspace.model");
const User = require("../models/user.model");
const Role = require("../models/role.model");

async function acceptWorkspaceInvitation(email, workspaceId, roleName) {
    const user = await User.findOne({ email });
    if (!user) throw new Error("Utilisateur introuvable");

    const role = await Role.findOne({ name: roleName });
    if (!role) throw new Error("Rôle introuvable");

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) throw new Error("Workspace introuvable");

    const alreadyMember = workspace.members.some(m => m.user.toString() === user._id.toString());
    if (!alreadyMember) {
        workspace.members.push({ user: user._id, role: role._id });
        await workspace.save();
    }

    return workspace;
}

module.exports = {
    acceptWorkspaceInvitation
};
