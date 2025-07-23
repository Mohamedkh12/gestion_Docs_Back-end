const { inviteUser, acceptInvitation, getInvitations, expireOneInvitation, getInvitationByToken} = require('../presenters/invitation.presenter');
const authenticate = require("../middleware/authenticate");

async function invitationRoutes(fastify, opts) {

    fastify.post('/inviteUser',{
        preValidation: [authenticate],
        handler:inviteUser
    });
    fastify.post('/accept-invitation', acceptInvitation);
    fastify.get('/getInvitations', { preValidation: [authenticate] }, getInvitations);
    fastify.patch('/invitations/:token/expire', { preValidation: [authenticate] }, expireOneInvitation);

}

module.exports = invitationRoutes;
