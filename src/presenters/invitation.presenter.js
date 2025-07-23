const crypto = require('crypto');
const {
    createInvitation,
    markAccepted,
    findByToken,
    expireInvitation,
    findAllInvitations
} = require('../repositories/invitation.repository');

const { findUserByEmail, getUserWithRolesAndPermissions } = require('../repositories/user.repository');
const { findRoleByName } = require('../repositories/role.repository');
const User = require('../models/user.model');
const { sendInvitation } = require('../services/mailer');
const path = require("path");
const dotenv = require("dotenv");
dotenv.config({ path: 'src/config/.env' });

const inviteUser = async (req, reply) => {
    try {
        const { email, role } = req.body;
        const inviter = req.user;

        const existingUser = await findUserByEmail(email);
        if (!existingUser) {
            return reply.status(400).send({ message: "Utilisateur non trouvé." });
        }

        const token = crypto.randomBytes(32).toString("hex");
        const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48h

        const invitationLink = `${process.env.BASE_URL}/accept-invitation?token=${token}`;

        await createInvitation({
            email,
            role,
            invitedBy: inviter.id,
            token,
            status: "pending",
            expiresAt
        });

        await sendInvitation(email, inviter.email, invitationLink);

        reply.send({ message: "Invitation envoyée avec succès." });
    } catch (e) {
        console.error(e);
        reply.status(500).send({ message: "Erreur serveur", error: e.message });
    }
};

const acceptInvitation = async (req, reply) => {
    try {
        const { token } = req.body;
        const invitation = await findByToken(token);

        if (!invitation) return reply.status(400).send({ message: "Invitation introuvable." });
        if (invitation.status === "accepted") return reply.status(400).send({ message: "Invitation déjà utilisée." });
        if (invitation.expiresAt < new Date()) return reply.status(400).send({ message: "Invitation expirée." });

        const user = await User.findOne({ email: invitation.email });
        if (!user) return reply.status(404).send({ message: "Utilisateur non trouvé." });

        const role = await findRoleByName(invitation.role);
        if (!role) return reply.status(404).send({ message: "Rôle non trouvé." });

        // Assigner le rôle
        if (!user.roles.includes(role._id)) {
            user.roles.push(role._id);
        }

        // Ajouter le workspace de l'invitant
        const inviterId = invitation.invitedBy;
        if (!user.workspaces.includes(inviterId)) {
            user.workspaces.push(inviterId);
        }

        await user.save();
        await markAccepted(token);

        const fullUser = await getUserWithRolesAndPermissions(user._id);

        req.session.user = {
            _id: fullUser._id,
            email: fullUser.email,
            roles: fullUser.roles,
            permissions: fullUser.permissions,
            workspaces: fullUser.workspaces
        };

        reply.send({
            message: "Invitation acceptée avec succès.",
            user: req.session.user
        });

    } catch (e) {
        console.error(e);
        reply.status(500).send({ message: "Erreur serveur", error: e.message });
    }
};

const getInvitations = async (req, reply) => {
    try {
        const invitations = await findAllInvitations();
        reply.send(invitations);
    } catch (e) {
        reply.status(500).send({ message: 'Erreur serveur', error: e.message });
    }
};

const getInvitationByToken = async (req, reply) => {
    try {
        const { token } = req.params;
        const invitation = await findByToken(token);

        if (!invitation || invitation.status !== "pending" || invitation.expiresAt < new Date()) {
            return reply.status(400).send({ message: "Lien invalide ou expiré." });
        }

        reply.send({ email: invitation.email });
    } catch (e) {
        reply.status(500).send({ message: "Erreur serveur", error: e.message });
    }
};

const expireOneInvitation = async (req, reply) => {
    try {
        const { token } = req.params;
        await expireInvitation(token);
        reply.send({ message: "Invitation expirée." });
    } catch (e) {
        reply.status(500).send({ message: 'Erreur serveur', error: e.message });
    }
};

module.exports = {
    inviteUser,
    acceptInvitation,
    getInvitations,
    expireOneInvitation,
    getInvitationByToken
};
