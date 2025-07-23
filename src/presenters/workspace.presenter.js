const workspaceRepo = require("../repositories/workspace.repository");
const roleRepo = require("../repositories/role.repository");
const userRepo = require("../repositories/user.repository");
const User = require("../models/user.model");

// Créer un workspace (le créateur devient admin)
async function createWorkspaceHandler(req, reply) {
    try {
        const { name } = req.body;
        const user = req.user;

        const adminRole = await roleRepo.findRoleByName("admin");
        if (!adminRole) {
            return reply.code(404).send({ message: "Rôle admin introuvable" });
        }

        const workspace = await workspaceRepo.createWorkspace({
            name,
            owner: user._id,
            members: [{ user: user._id, role: adminRole._id }],
        });

        // Optionnel : mettre à jour les memberships de l'utilisateur
        const currentUser = await User.findById(user._id);
        currentUser.memberships.push({ workspace: workspace._id, role: adminRole._id });
        await currentUser.save();

        reply.code(201).send(workspace);
    } catch (e) {
        reply.code(500).send({ message: e.message });
    }
}

// Récupérer les workspaces de l'utilisateur
async function getMyWorkspacesHandler(req, reply) {
    try {
        const user = req.user;
        const workspaces = await workspaceRepo.getUserWorkspaces(user._id);
        reply.send(workspaces);
    } catch (err) {
        reply.code(500).send({ message: err.message });
    }
}

// Ajouter un membre avec un rôle
async function addMemberHandler(req, reply) {
    try {
        const { workspaceId, userId, roleName } = req.body;

        const role = await roleRepo.findRoleByName(roleName);
        if (!role) return reply.code(404).send({ message: "Rôle non trouvé" });

        const workspace = await workspaceRepo.getWorkspaceById(workspaceId);
        if (!workspace) return reply.code(404).send({ message: "Workspace non trouvé" });

        const updatedWorkspace = await workspaceRepo.addMemberToWorkspace(workspaceId, userId, role._id);

        const user = await User.findById(userId);
        if (!user) return reply.code(404).send({ message: "Utilisateur non trouvé" });

        user.memberships.push({
            workspace: workspaceId,
            role: role._id,
        });
        await user.save();

        reply.send(updatedWorkspace);
    } catch (err) {
        reply.code(500).send({ message: err.message });
    }
}

// Supprimer un membre
async function removeMemberHandler(req, reply) {
    try {
        const { workspaceId, userId } = req.body;

        const workspace = await workspaceRepo.getWorkspaceById(workspaceId);
        if (!workspace) return reply.code(404).send({ message: "Workspace non trouvé" });

        workspace.members = workspace.members.filter(m => m.user.toString() !== userId);
        await workspace.save();

        // Supprimer aussi la membership côté utilisateur
        const user = await User.findById(userId);
        if (user) {
            user.memberships = user.memberships.filter(m => m.workspace.toString() !== workspaceId);
            await user.save();
        }

        reply.send(workspace);
    } catch (err) {
        reply.code(500).send({ message: err.message });
    }
}

// Modifier le rôle d’un membre
async function updateMemberRoleHandler(req, reply) {
    try {
        const { userId, roleId, workspaceId } = req.body;

        const user = await User.findById(userId);
        if (!user) return reply.code(404).send({ message: "Utilisateur non trouvé" });

        const membership = user.memberships.find(m => m.workspace.toString() === workspaceId);
        if (!membership) {
            return reply.code(404).send({ message: "L'utilisateur n'est pas membre du workspace" });
        }

        membership.role = roleId;
        await user.save();

        reply.send({ message: "Rôle mis à jour avec succès" });
    } catch (err) {
        reply.code(500).send({ message: err.message });
    }
}

// Obtenir un workspace par ID (avec détails)
async function getWorkspaceByIdHandler(req, reply) {
    try {
        const workspaceId = req.params.id;
        const workspace = await workspaceRepo.getWorkspaceById(workspaceId);
        if (!workspace) return reply.code(404).send({ message: "Workspace non trouvé" });
        reply.send(workspace);
    } catch (err) {
        reply.code(500).send({ message: err.message });
    }
}

module.exports = {
    createWorkspaceHandler,
    getMyWorkspacesHandler,
    addMemberHandler,
    removeMemberHandler,
    updateMemberRoleHandler,
    getWorkspaceByIdHandler,
};
