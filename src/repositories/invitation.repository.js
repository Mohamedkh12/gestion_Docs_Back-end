const Invitation = require("../models/invitation.model");

const createInvitation = async (data) => {
    return await Invitation.create(data);
};

const findByToken = async (token) => {
    return await Invitation.findOne({ token });
};

const markAccepted = async (token) => {
    return await Invitation.updateOne({ token }, { status: "accepted" });
};

const expireInvitation = async (token) => {
    return await Invitation.updateOne({ token }, { status: "expired" });
};

const findAllInvitations = async () => {
    return await Invitation.find().populate("invitedBy", "email");
};


module.exports = {
    createInvitation,
    findByToken,
    markAccepted,
    expireInvitation,
    findAllInvitations
};
