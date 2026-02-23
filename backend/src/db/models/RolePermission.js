import { Model, DataTypes } from 'sequelize';
import sequelize from '../connection.js';

class RolePermission extends Model {}

RolePermission.init(
  {
    roleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'roles', key: 'id' },
      onDelete: 'CASCADE',
    },
    permissionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'permissions', key: 'id' },
      onDelete: 'CASCADE',
    },
  },
  {
    sequelize,
    tableName: 'role_permissions',
    underscored: true,
    timestamps: false,
    indexes: [
      {
        unique: true,
        name: 'role_permissions_pk',
        fields: ['role_id', 'permission_id'],
      },
    ],
  }
);

// Remove auto-generated id PK — composite unique constraint is the key
RolePermission.removeAttribute('id');

export default RolePermission;
