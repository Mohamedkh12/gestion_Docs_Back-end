const User = require("../models/user.model");
const Role = require("../models/role.model");

function authorize(requiredPermissions = [], options = { workspace: false }) {
    return async function (req, reply) {
        const user = req.user;
        const workspaceId = req.body.workspaceId || req.params.id;

        if (!user || !workspaceId) {
            return reply.code(403).send({ message: "Accès refusé" });
        }

        // Rechercher les infos de membership de ce user pour ce workspace
        const membership = user.memberships.find((m) => m.workspace.toString() === workspaceId);

        if (!membership) {
            return reply.code(403).send({ message: "Aucune autorisation pour ce workspace" });
        }

        const role = await Role.findById(membership.role).populate("permissions");

        // Permissions du rôle
        const rolePermissions = role?.permissions?.map((p) => p.name) || [];

        // Permissions directes
        const directPermissions = (membership.permissions || []).map((p) => p.name);

        // Combine toutes les permissions
        const allPermissions = new Set([...rolePermissions, ...directPermissions]);

        const hasPermission = requiredPermissions.every((perm) => allPermissions.has(perm));

        if (!hasPermission) {
            return reply.code(403).send({ message: "Permission refusée" });
        }

        req.user.workspaceRole = role?.name;
        return;
    };
}

module.exports = { authorize };
