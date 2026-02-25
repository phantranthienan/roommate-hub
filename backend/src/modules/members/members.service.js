import { QueryTypes } from 'sequelize';
import { sequelize, RoomMember, Role } from '../../db/index.js';
import {
  NotFoundError,
  BadRequestError,
  ForbiddenError,
} from '../../errors/index.js';
import { canModifyMember, getUserHierarchyLevel } from '../../utils/permissions.js';

async function getRoomMembers(roomId) {
  const members = await sequelize.query(
    `SELECT rm.id, rm.user_id, u.first_name, u.last_name, u.username, u.avatar_url,
            rm.role_id, ro.name AS role_name, ro.hierarchy_level,
            rm.joined_at, rm.is_present, rm.presence_updated_at
     FROM room_members rm
     INNER JOIN users u ON rm.user_id = u.id
     INNER JOIN roles ro ON rm.role_id = ro.id
     WHERE rm.room_id = :roomId AND rm.is_active = true
     ORDER BY ro.hierarchy_level`,
    { replacements: { roomId }, type: QueryTypes.SELECT }
  );

  return members.map((m) => ({
    id: m.id,
    userId: m.user_id,
    firstName: m.first_name,
    lastName: m.last_name,
    username: m.username,
    avatarUrl: m.avatar_url,
    roleId: m.role_id,
    roleName: m.role_name,
    hierarchyLevel: m.hierarchy_level,
    joinedAt: m.joined_at,
    isPresent: m.is_present,
    presenceUpdatedAt: m.presence_updated_at,
  }));
}

async function removeMember(actorUserId, roomId, memberId) {
  // Intentionally raw SQL for role-aware target lookup with join constraints.
  const targets = await sequelize.query(
    `SELECT rm.id, rm.user_id, ro.name AS role_name
     FROM room_members rm
     INNER JOIN roles ro ON rm.role_id = ro.id
     WHERE rm.id = :memberId AND rm.room_id = :roomId AND rm.is_active = true
     LIMIT 1`,
    { replacements: { memberId, roomId }, type: QueryTypes.SELECT }
  );

  if (targets.length === 0) {
    throw new NotFoundError('Member');
  }

  const targetMember = targets[0];

  if (targetMember.user_id === actorUserId) {
    throw new BadRequestError('Cannot remove yourself. Use leave instead.');
  }

  if (targetMember.role_name === 'owner') {
    throw new ForbiddenError('Cannot remove the room owner');
  }

  const canModify = await canModifyMember(actorUserId, memberId, roomId);
  if (!canModify) {
    throw new ForbiddenError(
      'Cannot remove members at or above your hierarchy level'
    );
  }

  await RoomMember.update(
    { isActive: false },
    { where: { id: memberId } }
  );

  return { success: true };
}

async function changeMemberRole(actorUserId, roomId, memberId, newRoleId) {
  // Intentionally raw SQL for current-role lookup before hierarchy validation.
  const targets = await sequelize.query(
    `SELECT rm.id, rm.user_id, rm.role_id AS current_role_id, ro.name AS current_role_name
     FROM room_members rm
     INNER JOIN roles ro ON rm.role_id = ro.id
     WHERE rm.id = :memberId AND rm.room_id = :roomId AND rm.is_active = true
     LIMIT 1`,
    { replacements: { memberId, roomId }, type: QueryTypes.SELECT }
  );

  if (targets.length === 0) {
    throw new NotFoundError('Member');
  }

  const targetMember = targets[0];

  if (targetMember.user_id === actorUserId) {
    throw new BadRequestError('Cannot change your own role');
  }

  const newRole = await Role.findByPk(newRoleId);

  if (!newRole) {
    throw new NotFoundError('Role');
  }

  if (newRole.name === 'owner') {
    throw new ForbiddenError(
      'Cannot promote to owner. Use transfer ownership instead.'
    );
  }

  if (newRole.name === 'guest' || targetMember.current_role_name === 'guest') {
    throw new ForbiddenError(
      'Guest role cannot be assigned or changed via role management. Use guest invitations instead.'
    );
  }

  const actorLevel = await getUserHierarchyLevel(actorUserId, roomId);

  if (newRole.hierarchyLevel >= actorLevel) {
    throw new ForbiddenError(
      'Cannot assign roles at or above your hierarchy level'
    );
  }

  const canModify = await canModifyMember(actorUserId, memberId, roomId);
  if (!canModify) {
    throw new ForbiddenError(
      'Cannot modify members at or above your hierarchy level'
    );
  }

  const [, affectedRows] = await RoomMember.update(
    { roleId: newRoleId },
    { where: { id: memberId }, returning: true }
  );

  return {
    ...affectedRows[0].get({ plain: true }),
    roleName: newRole.name,
  };
}

async function transferOwnership(currentOwnerId, roomId, newOwnerId) {
  if (currentOwnerId === newOwnerId) {
    throw new BadRequestError('Cannot transfer ownership to yourself');
  }

  return sequelize.transaction(async (t) => {
    const ownerRole = await Role.findOne({
      where: { name: 'owner' },
      transaction: t,
    });

    const adminRole = await Role.findOne({
      where: { name: 'admin' },
      transaction: t,
    });

    const newOwnerMember = await RoomMember.findOne({
      where: { userId: newOwnerId, roomId, isActive: true },
      transaction: t,
    });

    if (!newOwnerMember) {
      throw new NotFoundError('Target member');
    }

    await RoomMember.update(
      { roleId: adminRole.id },
      {
        where: { userId: currentOwnerId, roomId },
        transaction: t,
      }
    );

    await RoomMember.update(
      { roleId: ownerRole.id },
      {
        where: { id: newOwnerMember.id },
        transaction: t,
      }
    );

    return { success: true };
  });
}

export {
  getRoomMembers,
  removeMember,
  changeMemberRole,
  transferOwnership,
};
