import { Model, DataTypes } from 'sequelize';
import sequelize from '../connection.js';

class FeedbackVote extends Model {}

FeedbackVote.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    feedbackId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'feedback', key: 'id' },
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
    tableName: 'feedback_votes',
    underscored: true,
    timestamps: false,
    indexes: [
      {
        unique: true,
        name: 'feedback_vote_unique',
        fields: ['feedback_id', 'room_member_id'],
      },
      { name: 'idx_feedback_votes_feedback', fields: ['feedback_id'] },
    ],
  }
);

export default FeedbackVote;
