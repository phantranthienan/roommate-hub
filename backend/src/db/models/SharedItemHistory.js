import { Model, DataTypes } from 'sequelize';
import sequelize from '../connection.js';

class SharedItemHistory extends Model {}

SharedItemHistory.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    itemId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'shared_items', key: 'id' },
      onDelete: 'CASCADE',
    },
    purchasedBy: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'room_members', key: 'id' },
    },
    quantity: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    currency: {
      type: DataTypes.STRING(10),
      defaultValue: 'EUR',
    },
    notes: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    purchasedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'shared_item_history',
    underscored: true,
    timestamps: false,
    indexes: [{ name: 'idx_item_history_item', fields: ['item_id'] }],
  }
);

export default SharedItemHistory;
