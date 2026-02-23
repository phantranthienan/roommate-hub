import { Model, DataTypes } from 'sequelize';
import sequelize from '../connection.js';

class RoomMember extends Model {}

RoomMember.init(
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
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' },
      onDelete: 'CASCADE',
    },
    roleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'roles', key: 'id' },
    },
    joinedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    isPresent: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    presenceUpdatedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    invitedBy: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: 'users', key: 'id' },
    },
  },
  {
    sequelize,
    tableName: 'room_members',
    underscored: true,
    timestamps: false,
    indexes: [
      {
        unique: true,
        name: 'room_members_room_user',
        fields: ['room_id', 'user_id'],
      },
      { name: 'idx_room_members_room', fields: ['room_id'] },
      { name: 'idx_room_members_user', fields: ['user_id'] },
      { name: 'idx_room_members_active', fields: ['room_id', 'is_active'] },
      {
        name: 'idx_room_members_active_role',
        fields: ['room_id', 'is_active', 'role_id'],
      },
    ],
  }
);

export default RoomMember;
