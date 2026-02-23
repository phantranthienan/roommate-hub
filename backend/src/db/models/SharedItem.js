import { Model, DataTypes } from 'sequelize';
import sequelize from '../connection.js';

class SharedItem extends Model {}

SharedItem.init(
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
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('available', 'low', 'out_of_stock'),
      defaultValue: 'available',
    },
    lastPurchasedBy: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: 'room_members', key: 'id' },
    },
    lastPurchasedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'shared_items',
    underscored: true,
    indexes: [
      { name: 'idx_shared_items_room', fields: ['room_id'] },
      { name: 'idx_shared_items_status', fields: ['room_id', 'status'] },
    ],
  }
);

export default SharedItem;
