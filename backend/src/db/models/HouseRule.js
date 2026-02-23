import { Model, DataTypes } from 'sequelize';
import sequelize from '../connection.js';

class HouseRule extends Model {}

HouseRule.init(
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
    proposedBy: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'room_members', key: 'id' },
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('proposed', 'approved', 'rejected', 'archived'),
      defaultValue: 'proposed',
    },
    votingDeadline: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    approvedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    displayOrder: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'house_rules',
    underscored: true,
    indexes: [
      { name: 'idx_house_rules_room', fields: ['room_id'] },
      { name: 'idx_house_rules_status', fields: ['room_id', 'status'] },
    ],
  }
);

export default HouseRule;
