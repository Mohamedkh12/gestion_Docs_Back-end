function hasWorkspacePermission(user, workspace, requiredPermission) {
    const membership = workspace.members.find(m => m.user._id.toString() === user._id.toString());
    if (!membership || !membership.role) return false;
    const permissions = membership.role.permissions.map(p => p.name);
    return permissions.includes(requiredPermission);
}

module.exports = { hasWorkspacePermission };
