const User = require("../models/user.model");

const findUserByEmail = async (email) => {
    return await User.findOne({ email }).exec();
};

const createUser = async (userData) => {
    const user = new User(userData);
    const result = await user.save();
    return result;
};

async function getUserWithRolesAndPermissions(userId) {
    return await User.findById(userId)
        .populate({
            path: 'roles',
            populate: { path: 'permissions' }
        })
        .populate('permissions');
}

module.exports = { findUserByEmail, createUser,getUserWithRolesAndPermissions };
