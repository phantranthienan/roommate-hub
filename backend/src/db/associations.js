import {
  User,
  Room,
  Role,
  Permission,
  RolePermission,
  RoomMember,
  Task,
  Feedback,
  FeedbackVote,
  HouseRule,
  RuleVote,
  SharedItem,
  GuestInvitation,
} from './models/index.js';

// rbac

Role.belongsToMany(Permission, {
  through: RolePermission,
  foreignKey: 'roleId',
  otherKey: 'permissionId',
});
Permission.belongsToMany(Role, {
  through: RolePermission,
  foreignKey: 'permissionId',
  otherKey: 'roleId',
});

// users and room members

User.hasMany(RoomMember, { foreignKey: 'userId', as: 'roomMemberships' });
RoomMember.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(RoomMember, { foreignKey: 'invitedBy', as: 'invitedMembers' });
RoomMember.belongsTo(User, { foreignKey: 'invitedBy', as: 'inviter' });

// rooms and room members

Room.hasMany(RoomMember, { foreignKey: 'roomId', onDelete: 'CASCADE' });
RoomMember.belongsTo(Room, { foreignKey: 'roomId' });

// roles and room members

Role.hasMany(RoomMember, { foreignKey: 'roleId' });
RoomMember.belongsTo(Role, { foreignKey: 'roleId', as: 'role' });

// rooms and tasks

Room.hasMany(Task, { foreignKey: 'roomId', onDelete: 'CASCADE' });
Task.belongsTo(Room, { foreignKey: 'roomId' });

RoomMember.hasMany(Task, { foreignKey: 'createdBy', as: 'tasksCreated' });
Task.belongsTo(RoomMember, { foreignKey: 'createdBy', as: 'creator' });

RoomMember.hasMany(Task, { foreignKey: 'assignedTo', as: 'tasksAssigned' });
Task.belongsTo(RoomMember, { foreignKey: 'assignedTo', as: 'assignee' });


// rooms and feedback

Room.hasMany(Feedback, { foreignKey: 'roomId', onDelete: 'CASCADE' });
Feedback.belongsTo(Room, { foreignKey: 'roomId' });

RoomMember.hasMany(Feedback, { foreignKey: 'createdBy', as: 'feedbackCreated' });
Feedback.belongsTo(RoomMember, { foreignKey: 'createdBy', as: 'creator' });

Feedback.hasMany(FeedbackVote, { foreignKey: 'feedbackId', onDelete: 'CASCADE' });
FeedbackVote.belongsTo(Feedback, { foreignKey: 'feedbackId' });

RoomMember.hasMany(FeedbackVote, { foreignKey: 'roomMemberId', as: 'feedbackVotes' });
FeedbackVote.belongsTo(RoomMember, { foreignKey: 'roomMemberId', as: 'voter' });

// rooms and house rules

Room.hasMany(HouseRule, { foreignKey: 'roomId', onDelete: 'CASCADE' });
HouseRule.belongsTo(Room, { foreignKey: 'roomId' });

RoomMember.hasMany(HouseRule, { foreignKey: 'proposedBy', as: 'rulesProposed' });
HouseRule.belongsTo(RoomMember, { foreignKey: 'proposedBy', as: 'proposer' });

HouseRule.hasMany(RuleVote, { foreignKey: 'ruleId', onDelete: 'CASCADE' });
RuleVote.belongsTo(HouseRule, { foreignKey: 'ruleId' });

RoomMember.hasMany(RuleVote, { foreignKey: 'roomMemberId', as: 'ruleVotes' });
RuleVote.belongsTo(RoomMember, { foreignKey: 'roomMemberId', as: 'voter' });

// rooms and shared items

Room.hasMany(SharedItem, { foreignKey: 'roomId', onDelete: 'CASCADE' });
SharedItem.belongsTo(Room, { foreignKey: 'roomId' });

// rooms and guest invitations

Room.hasMany(GuestInvitation, { foreignKey: 'roomId', onDelete: 'CASCADE' });
GuestInvitation.belongsTo(Room, { foreignKey: 'roomId' });

RoomMember.hasMany(GuestInvitation, { foreignKey: 'invitedBy', as: 'guestInvitationsSent' });
GuestInvitation.belongsTo(RoomMember, { foreignKey: 'invitedBy', as: 'inviter' });

User.hasMany(GuestInvitation, { foreignKey: 'guestUserId', as: 'guestInvitationsReceived' });
GuestInvitation.belongsTo(User, { foreignKey: 'guestUserId', as: 'guestUser' });
