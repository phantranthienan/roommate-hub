import { QueryTypes } from 'sequelize';
import { sequelize, RoomMember } from '../../db/index.js';
import { getRoomMember } from '../../utils/permissions.js';

async function getRoomPresence(roomId) {
  const members = await sequelize.query(
    `SELECT rm.id, rm.user_id, u.first_name, u.last_name, u.avatar_url,
            ro.name AS role_name, rm.is_present, rm.presence_updated_at
     FROM room_members rm
     INNER JOIN users u ON rm.user_id = u.id
     INNER JOIN roles ro ON rm.role_id = ro.id
     WHERE rm.room_id = :roomId AND rm.is_active = true
     ORDER BY u.first_name`,
    { replacements: { roomId }, type: QueryTypes.SELECT }
  );

  return members.map((m) => ({
    id: m.id,
    userId: m.user_id,
    firstName: m.first_name,
    lastName: m.last_name,
    avatarUrl: m.avatar_url,
    roleName: m.role_name,
    isPresent: m.is_present,
    presenceUpdatedAt: m.presence_updated_at,
  }));
}

async function updatePresence(roomId, userId, isPresent) {
  const member = await getRoomMember(userId, roomId);

  const [, affectedRows] = await RoomMember.update(
    { isPresent, presenceUpdatedAt: new Date() },
    { where: { id: member.id }, returning: true }
  );

  const updated = affectedRows[0];
  return {
    id: updated.id,
    isPresent: updated.isPresent,
    presenceUpdatedAt: updated.presenceUpdatedAt,
  };
}

export {
  getRoomPresence,
  updatePresence,
};
