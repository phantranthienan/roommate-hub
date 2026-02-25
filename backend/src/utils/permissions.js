import { Op, QueryTypes } from 'sequelize';
import { sequelize, RoomMember } from '../db/index.js';

export async function hasPermission(userId, roomId, permissionName) {
  const result = await sequelize.query(
    `SELECT count(*) AS count
     FROM room_members rm
     INNER JOIN role_permissions rp ON rm.role_id = rp.role_id
     INNER JOIN permissions p ON rp.permission_id = p.id
     WHERE rm.user_id = :userId
       AND rm.room_id = :roomId
       AND rm.is_active = true
       AND (rm.expires_at IS NULL OR rm.expires_at > NOW())
       AND p.name = :permissionName`,
    {
      replacements: { userId, roomId, permissionName },
      type: QueryTypes.SELECT,
    }
  );

  return Number(result[0].count) > 0;
}

export async function isRoomMember(userId, roomId) {
  const count = await RoomMember.count({
    where: {
      userId,
      roomId,
      isActive: true,
      [Op.or]: [{ expiresAt: null }, { expiresAt: { [Op.gt]: new Date() } }],
    },
  });

  return count > 0;
}

export async function getRoomMember(userId, roomId) {
  const member = await RoomMember.findOne({
    where: {
      userId,
      roomId,
      isActive: true,
      [Op.or]: [{ expiresAt: null }, { expiresAt: { [Op.gt]: new Date() } }],
    },
  });

  return member;
}

export async function getUserHierarchyLevel(userId, roomId) {
  const result = await sequelize.query(
    `SELECT r.hierarchy_level
     FROM room_members rm
     INNER JOIN roles r ON rm.role_id = r.id
     WHERE rm.user_id = :userId
       AND rm.room_id = :roomId
       AND rm.is_active = true
       AND (rm.expires_at IS NULL OR rm.expires_at > NOW())
     LIMIT 1`,
    {
      replacements: { userId, roomId },
      type: QueryTypes.SELECT,
    }
  );

  return result.length > 0 ? result[0].hierarchy_level : null;
}

export async function canModifyMember(actorUserId, targetMemberId, roomId) {
  const actorLevel = await getUserHierarchyLevel(actorUserId, roomId);
  if (actorLevel === null) return false;

  const result = await sequelize.query(
    `SELECT r.hierarchy_level
     FROM room_members rm
     INNER JOIN roles r ON rm.role_id = r.id
     WHERE rm.id = :targetMemberId
       AND rm.room_id = :roomId
       AND rm.is_active = true
       AND (rm.expires_at IS NULL OR rm.expires_at > NOW())
     LIMIT 1`,
    {
      replacements: { targetMemberId, roomId },
      type: QueryTypes.SELECT,
    }
  );

  if (result.length === 0) return false;

  return actorLevel > result[0].hierarchy_level;
}
