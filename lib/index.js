const Utils = require('./utils');
// import { intersection, uniq, flatten, difference } from './utils';

const Users = {};

/**
 * @summary Groups.groups object
 */
Users.groups = {};

/**
 * @summary Group class
 */
function Group() {
    this.actions = [];
}

Group.prototype.can = function can(actions) {
    actions = Array.isArray(actions) ? actions : [actions];
    this.actions = this.actions.concat(actions);
};

Group.prototype.cannot = function cannot(actions) {
    actions = Array.isArray(actions) ? actions : [actions];
    this.actions = Utils.difference(this.actions, actions);
};

/**
 * Helpers
 *
 * @summary create a new group
 * @param {String} groupName
 */
Users.createGroup = function (groupName) {
    Users.groups[groupName] = new Group();
};

/**
 * @summary get a list of a user's groups
 * @param {Object} user
 */
Users.getGroups = function getGroups(user) {
    var userGroups = [];

    if (!user) { // guests user
        userGroups = ['guests'];
    } else {
        userGroups = ['members'];

        if (user.__groups) { // custom groups
            userGroups = userGroups.concat(user.__groups);
        }

        if (Users.isAdmin(user)) { // admin
            userGroups.push('admins');
        }
    }
    return userGroups;
};

/**
 * @summary get a list of all the actions a user can perform
 * @param {Object} user
 */
Users.getActions = function getActions(user) {
    const userGroups = Users.getGroups(user);
    const groupActions = userGroups.map(function (groupName) {
        // note: make sure groupName corresponds to an actual group
        const group = Users.groups[groupName];
        return group && group.actions;
    });
    return Utils.uniq(Utils.flatten(groupActions));
};

/**
 * @summary check if a user is a member of a group
 * @param {Array} user
 * @param {String} group or array of groups
 */
Users.isMemberOf = function isMemberOf(user, groupOrGroups) {
    const groups = Array.isArray(groupOrGroups) ? groupOrGroups : [groupOrGroups];

    // everybody is considered part of the guests group
    if (groups.indexOf('guests') !== -1) return true;

    // every logged in user is part of the members group
    if (groups.indexOf('members') !== -1) return !!user;

    // the admin group have their own function
    if (groups.indexOf('admin') !== -1) return Users.isAdmin(user);

    // else test for the `groups` field
    return Utils.intersection(Users.getGroups(user), groups).length > 0;
};

/**
 * @summary check if a user can perform a specific action
 * @param {Object} user
 * @param {String} action
 */
Users.canDo = function canDo(user, action) {
    return Users.getActions(user).indexOf(action) !== -1;
};

/**
 * @summary Check if a user owns a document
 * @param user
 * @param document - The document to check (comment, user object, etc.)
 * @returns {boolean}
 */
Users.owns = function owns(user, document) {
    document = document || Object.create(Object.prototype);
    try {
        if (document.userId) {
            // case 1: document is a post or a comment, use userId to check
            return user._id === document.userId;
        }
        // case 2: document is a user, use _id to check
        return user._id === document._id;
    } catch (e) {
        return false; // user not logged in
    }
};

/**
 * @summary Check if a user is an admin
 * @param {Object|string} userOrUserId - The user or their userId
 */
Users.isAdmin = function isAdmin(user) {
    try {
        return user && user.isAdmin;
    } catch (e) {
        return false; // user not logged in
    }
};

/**
 * Initialize default user groups...
 *
 * @summary initialize the 3 out-of-the-box groups
 */
// Users.createGroup('guests'); // non-logged-in users
// Users.createGroup('members'); // regular users
//
// const membersActions = [
//     'users.new',
//     'users.edit.own',
//     'users.remove.own'
// ];
// Users.groups.members.can(membersActions);
//
// Users.createGroup('admins'); // admin users
//
// const adminActions = [
//     'users.new',
//     'users.edit.all',
//     'users.remove.all',
//     'settings.edit'
// ];
// Users.groups.admins.can(adminActions);

module.exports = Users;

// export default Users;
