import { QueryTypes } from 'sequelize';
import crypto from 'crypto';
import { sequelize, Room, RoomMember, Role, HouseRule, GuestInvitation } from '../../db/index.js';
import {
  NotFoundError,
  ConflictError,
  BadRequestError,
  ForbiddenError,
} from '../../errors/index.js';

async function createRoom(userId, input) {
  return sequelize.transaction(async (t) => {
    const inviteCode = crypto.randomBytes(6).toString('base64url').slice(0, 10);

    const room = await Room.create(
      {
        name: input.name,
        description: input.description,
        inviteCode,
      },
      { transaction: t }
    );

    const ownerRole = await Role.findOne({
      where: { name: 'owner' },
      transaction: t,
    });

    if (!ownerRole) {
      throw new Error('Owner role not found. Please run database seed.');
    }

    await RoomMember.create(
      {
        roomId: room.id,
        userId,
        roleId: ownerRole.id,
      },
      { transaction: t }
    );

    return room.get({ plain: true });
  });
}

async function getUserRooms(userId) {
  await sequelize.query(
    `UPDATE room_members SET is_active = false
     WHERE user_id = :userId AND is_active = true
       AND expires_at IS NOT NULL AND expires_at < NOW()`,
    { replacements: { userId }, type: QueryTypes.UPDATE }
  );

  const userRooms = await sequelize.query(
    `SELECT r.id, r.name, r.description, r.invite_code, r.is_active,
            r.created_at, r.updated_at, ro.name AS member_role, rm.joined_at
     FROM room_members rm
     INNER JOIN rooms r ON rm.room_id = r.id
     INNER JOIN roles ro ON rm.role_id = ro.id
     WHERE rm.user_id = :userId AND rm.is_active = true`,
    { replacements: { userId }, type: QueryTypes.SELECT }
  );

  return userRooms.map((r) => ({
    id: r.id,
    name: r.name,
    description: r.description,
    inviteCode: r.invite_code,
    isActive: r.is_active,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    memberRole: r.member_role,
    joinedAt: r.joined_at,
  }));
}

async function getRoom(roomId, userId) {
  const rooms = await sequelize.query(
    `SELECT r.id, r.name, r.description, r.invite_code, r.is_active,
            r.created_at, r.updated_at
     FROM rooms r
     INNER JOIN room_members rm ON r.id = rm.room_id
     WHERE r.id = :roomId AND rm.user_id = :userId AND rm.is_active = true
     LIMIT 1`,
    { replacements: { roomId, userId }, type: QueryTypes.SELECT }
  );

  if (rooms.length === 0) {
    throw new NotFoundError('Room');
  }

  const r = rooms[0];

  const memberCount = await RoomMember.count({
    where: { roomId, isActive: true },
  });

  return {
    id: r.id,
    name: r.name,
    description: r.description,
    inviteCode: r.invite_code,
    isActive: r.is_active,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    memberCount,
  };
}

async function updateRoom(roomId, input) {
  if (!input.name && !input.description) {
    throw new BadRequestError('No fields to update');
  }

  const [affectedCount, affectedRows] = await Room.update(
    { ...input, updatedAt: new Date() },
    { where: { id: roomId }, returning: true }
  );

  if (affectedCount === 0) {
    throw new NotFoundError('Room');
  }

  return affectedRows[0].get({ plain: true });
}

async function deleteRoom(roomId) {
  const [affectedCount, affectedRows] = await Room.update(
    { isActive: false, updatedAt: new Date() },
    { where: { id: roomId }, returning: true }
  );

  if (affectedCount === 0) {
    throw new NotFoundError('Room');
  }

  await RoomMember.update(
    { isActive: false },
    { where: { roomId } }
  );

  return affectedRows[0].get({ plain: true });
}

async function joinRoom(userId, inviteCode) {
  const room = await Room.findOne({
    where: { inviteCode, isActive: true },
  });

  if (!room) {
    const invitation = await GuestInvitation.findOne({
      where: { invitationCode: inviteCode, isActive: true },
    });

    if (!invitation) {
      throw new NotFoundError('Invalid invite code');
    }

    if (new Date() > invitation.validUntil) {
      throw new BadRequestError('This guest invitation has expired');
    }

    const existingMember = await RoomMember.findOne({
      where: { roomId: invitation.roomId, userId },
    });

    if (existingMember?.isActive) {
      throw new ConflictError('You are already a member of this room');
    }

    const guestRole = await Role.findOne({ where: { name: 'guest' } });
    if (!guestRole) throw new Error('Guest role not found. Please run database seed.');

    if (existingMember) {
      await existingMember.update({
        isActive: true,
        roleId: guestRole.id,
        expiresAt: invitation.validUntil,
        joinedAt: new Date(),
      });
    } else {
      await RoomMember.create({
        roomId: invitation.roomId,
        userId,
        roleId: guestRole.id,
        expiresAt: invitation.validUntil,
      });
    }

    await invitation.update({ guestUserId: userId, isActive: false });

    const guestRoom = await Room.findByPk(invitation.roomId);
    return {
      room: guestRoom ? guestRoom.get({ plain: true }) : null,
      member: null,
      pendingRules: [],
    };
  }

  const existingMember = await RoomMember.findOne({
    where: { roomId: room.id, userId },
  });

  if (existingMember) {
    if (existingMember.isActive) {
      throw new ConflictError('You are already a member of this room');
    }
    await existingMember.update({ isActive: true, joinedAt: new Date() });

    return {
      room: room.get({ plain: true }),
      member: existingMember.get({ plain: true }),
      pendingRules: await getPendingRules(room.id),
    };
  }

  const memberRole = await Role.findOne({ where: { name: 'member' } });

  if (!memberRole) {
    throw new Error('Member role not found. Please run database seed.');
  }

  const member = await RoomMember.create({
    roomId: room.id,
    userId,
    roleId: memberRole.id,
  });

  const pendingRules = await getPendingRules(room.id);

  return {
    room: room.get({ plain: true }),
    member: member.get({ plain: true }),
    pendingRules,
  };
}

async function leaveRoom(userId, roomId) {
  const members = await sequelize.query(
    `SELECT rm.id, rm.role_id, ro.name AS role_name
     FROM room_members rm
     INNER JOIN roles ro ON rm.role_id = ro.id
     WHERE rm.user_id = :userId AND rm.room_id = :roomId AND rm.is_active = true
     LIMIT 1`,
    { replacements: { userId, roomId }, type: QueryTypes.SELECT }
  );

  if (members.length === 0) {
    throw new NotFoundError('Membership');
  }

  const member = members[0];

  if (member.role_name === 'owner') {
    throw new ForbiddenError(
      'Owner cannot leave the room. Transfer ownership first.'
    );
  }

  await RoomMember.update(
    { isActive: false },
    { where: { id: member.id } }
  );

  return { success: true };
}

async function getPendingRules(roomId) {
  const rules = await HouseRule.findAll({
    where: { roomId, status: 'approved' },
    attributes: ['id', 'title', 'description', 'category'],
  });

  return rules.map((r) => r.get({ plain: true }));
}

export {
  createRoom,
  getUserRooms,
  getRoom,
  updateRoom,
  deleteRoom,
  joinRoom,
  leaveRoom,
};
