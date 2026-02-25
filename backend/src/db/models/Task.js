import { Model, DataTypes } from 'sequelize';
import sequelize from '../connection.js';

class Task extends Model {}

Task.init(
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
    assignedTo: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: 'room_members', key: 'id' },
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    dueDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('pending', 'done'),
      defaultValue: 'pending',
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'tasks',
    underscored: true,
    indexes: [
      { name: 'idx_tasks_room', fields: ['room_id'] },
      { name: 'idx_tasks_assigned', fields: ['assigned_to'] },
      { name: 'idx_tasks_due', fields: ['room_id', 'due_date'] },
      { name: 'idx_tasks_status', fields: ['room_id', 'status'] },
      {
        name: 'idx_tasks_room_assigned_status',
        fields: ['room_id', 'assigned_to', 'status'],
      },
    ],
  }
);

export default Task;
