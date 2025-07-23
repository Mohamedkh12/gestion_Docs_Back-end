function hasPermission(user, requiredPermission) {
    const rolePermissions = user.roles.flatMap(role => role.permissions.map(p => p.name));
    const directPermissions = user.permissions.map(p => p.name);

    const allPermissions = new Set([...rolePermissions, ...directPermissions]);

    return allPermissions.has(requiredPermission);
}

function getAllUserPermissions(user) {
    const rolePermissions = user.roles.flatMap(role => role.permissions.map(p => p.name));
    const directPermissions = user.permissions.map(p => p.name);
    return [...new Set([...rolePermissions, ...directPermissions])];
}

module.exports = {
    hasPermission,
    getAllUserPermissions
};
