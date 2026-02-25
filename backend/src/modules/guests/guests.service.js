import crypto from 'crypto';
import { GuestInvitation, RoomMember, Room, Role } from '../../db/index.js';
import { NotFoundError, BadRequestError, ConflictError, ConfigurationError } from '../../errors/index.js';
import { getRoomMember } from '../../utils/permissions.js';

async function listInvitations(roomId) {
  const invitations = await GuestInvitation.findAll({
    where: { roomId },
    attributes: [
      'id', 'roomId', 'guestUsername', 'guestUserId', 'invitationCode',
      'validFrom', 'validUntil', 'isActive', 'createdAt',
      ['invited_by', 'invitedById'],
    ],
    order: [['createdAt', 'ASC']],
  });

  return invitations.map((i) => i.get({ plain: true }));
}

async function createInvitation(roomId, inviterUserId, input) {
  const inviterMember = await getRoomMember(inviterUserId, roomId);

  const validFrom = new Date();
  const validUntil = new Date(input.validUntil);

  if (validUntil <= validFrom) {
    throw new BadRequestError('Valid until must be in the future');
  }

  const invitationCode = crypto.randomBytes(16).toString('base64url');

  const invitation = await GuestInvitation.create({
    roomId,
    invitedBy: inviterMember.id,
    guestUsername: input.label ?? null,
    invitationCode,
    validFrom,
    validUntil,
  });

  return invitation.get({ plain: true });
}

async function revokeInvitation(roomId, invitationId) {
  const [affectedCount] = await GuestInvitation.update(
    { isActive: false },
    { where: { id: invitationId, roomId } }
  );

  if (affectedCount === 0) {
    throw new NotFoundError('Invitation');
  }

  return { success: true };
}

async function acceptInvitation(guestUserId, invitationCode) {
  const invitation = await GuestInvitation.findOne({
    where: { invitationCode, isActive: true },
  });

  if (!invitation) {
    throw new NotFoundError('Invitation');
  }

  const now = new Date();
  if (now < invitation.validFrom || now > invitation.validUntil) {
    throw new BadRequestError('Invitation has expired or is not yet valid');
  }

  const existingMember = await RoomMember.findOne({
    where: { roomId: invitation.roomId, userId: guestUserId },
  });

  if (existingMember) {
    if (existingMember.isActive) {
      throw new ConflictError('You are already a member of this room');
    }
    const guestRole = await Role.findOne({ where: { name: 'guest' } });
    if (!guestRole) throw new ConfigurationError('Guest role not found. Please run database seed.');

    await existingMember.update({
      isActive: true,
      roleId: guestRole.id,
      expiresAt: invitation.validUntil,
      joinedAt: new Date(),
    });
  } else {
    const guestRole = await Role.findOne({ where: { name: 'guest' } });

    if (!guestRole) {
      throw new ConfigurationError('Guest role not found. Please run database seed.');
    }

    await RoomMember.create({
      roomId: invitation.roomId,
      userId: guestUserId,
      roleId: guestRole.id,
      expiresAt: invitation.validUntil,
    });
  }

  await invitation.update({ guestUserId, isActive: false });

  const room = await Room.findByPk(invitation.roomId);

  return { success: true, room: room ? room.get({ plain: true }) : null };
}

export {
  listInvitations,
  createInvitation,
  revokeInvitation,
  acceptInvitation,
};
