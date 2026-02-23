import { Model, DataTypes } from 'sequelize';
import sequelize from '../connection.js';

class GuestInvitation extends Model {}

GuestInvitation.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    roomId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'rooms', key: 'id' },
      onDelete: 'CASCADE',
    },
    invitedBy: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'room_members', key: 'id' },
    },
    guestUsername: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    guestUserId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: 'users', key: 'id' },
    },
    invitationCode: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    validFrom: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    validUntil: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    createdAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'guest_invitations',
    underscored: true,
    updatedAt: false,
    validate: {
      validDateRange() {
        if (this.validUntil <= this.validFrom) {
          throw new Error('validUntil must be after validFrom');
        }
      },
    },
    indexes: [
      { name: 'idx_guest_invitations_room', fields: ['room_id'] },
      { name: 'idx_guest_invitations_code', fields: ['invitation_code'] },
      {
        name: 'idx_guest_invitations_active',
        fields: ['room_id', 'is_active', 'valid_until'],
      },
    ],
  }
);

export default GuestInvitation;
