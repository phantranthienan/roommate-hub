import { Model, DataTypes } from 'sequelize';
import sequelize from '../connection.js';

class Feedback extends Model {}

Feedback.init(
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
    createdBy: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'room_members', key: 'id' },
    },
    type: {
      type: DataTypes.ENUM('issue', 'suggestion'),
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('open', 'done', 'rejected', 'archived'),
      defaultValue: 'open',
    },
    closedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'feedback',
    underscored: true,
    indexes: [
      { name: 'idx_feedback_room', fields: ['room_id'] },
      { name: 'idx_feedback_status', fields: ['room_id', 'status'] },
      { name: 'idx_feedback_type', fields: ['room_id', 'type'] },
    ],
  }
);

export default Feedback;
