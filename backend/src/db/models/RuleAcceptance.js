import { Model, DataTypes } from 'sequelize';
import sequelize from '../connection.js';

class RuleAcceptance extends Model {}

RuleAcceptance.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    ruleId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'house_rules', key: 'id' },
      onDelete: 'CASCADE',
    },
    roomMemberId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'room_members', key: 'id' },
      onDelete: 'CASCADE',
    },
    acceptedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'rule_acceptances',
    underscored: true,
    timestamps: false,
    indexes: [
      {
        unique: true,
        name: 'rule_acceptance_unique',
        fields: ['rule_id', 'room_member_id'],
      },
    ],
  }
);

export default RuleAcceptance;
