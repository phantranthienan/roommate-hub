import { Model, DataTypes } from 'sequelize';
import sequelize from '../connection.js';

class RuleVote extends Model {}

RuleVote.init(
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
    },
    votedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'rule_votes',
    underscored: true,
    timestamps: false,
    indexes: [
      {
        unique: true,
        name: 'rule_vote_unique',
        fields: ['rule_id', 'room_member_id'],
      },
      { name: 'idx_rule_votes_rule', fields: ['rule_id'] },
    ],
  }
);

export default RuleVote;
