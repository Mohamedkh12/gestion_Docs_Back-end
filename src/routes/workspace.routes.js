const authenticate = require("../middleware/authenticate");
const {authorize} = require("../middleware/authorize");
const workspacePresenter = require("../presenters/workspace.presenter");

async function workspaceRoutes(fastify, options) {
    // Créer un workspace
    fastify.post("/", {
        preHandler: [authenticate]
    }, workspacePresenter.createWorkspaceHandler);

    // Récupérer les workspaces de l'utilisateur
    fastify.get("/my", {
        preHandler: [authenticate]
    }, workspacePresenter.getMyWorkspacesHandler);

    // Ajouter un membre (permission: manage_members)
    fastify.post("/add-member", {
        preHandler: [authenticate, authorize(["manage_members"], { workspace: true })]
    }, workspacePresenter.addMemberHandler);

    // Supprimer un membre (permission: manage_members)
    fastify.post("/remove-member", {
        preHandler: [authenticate, authorize(["manage_members"], { workspace: true })]
    }, workspacePresenter.removeMemberHandler);

    // Modifier le rôle d'un membre (permission: manage_members)
    fastify.post("/update-member-role", {
        preHandler: [authenticate, authorize(["manage_members"], { workspace: true })]
    }, workspacePresenter.updateMemberRoleHandler);

    // Récupérer les détails d’un workspace (permission: view_workspace)
    fastify.get("/:id", {
        preHandler: [authenticate, authorize(["view_workspace"], { workspace: true })]
    }, workspacePresenter.getWorkspaceByIdHandler);
}

module.exports = workspaceRoutes;
