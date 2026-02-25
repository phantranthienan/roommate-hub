import { Role, Permission, RolePermission } from './models/index.js';

const defaultRoles = [
  { name: 'owner', description: 'creator and primary administrator', hierarchyLevel: 100 },
  { name: 'admin', description: 'room administrator with management privileges', hierarchyLevel: 75 },
  { name: 'member', description: 'regular roommate with standard privileges', hierarchyLevel: 50 },
  { name: 'guest', description: 'temporary visitor with limited privileges', hierarchyLevel: 10 },
];

const defaultPermissions = [
  // members
  { name: 'invite_members', description: 'can invite new members to the room', category: 'members' },
  { name: 'remove_members', description: 'can remove members from the room', category: 'members' },
  { name: 'change_roles', description: 'can change member roles', category: 'members' },
  { name: 'invite_guests', description: 'can invite temporary guests', category: 'members' },
  // tasks
  { name: 'create_task', description: 'can create household tasks', category: 'tasks' },
  { name: 'update_task', description: 'can update task details', category: 'tasks' },
  { name: 'complete_task', description: 'can mark tasks as completed', category: 'tasks' },
  { name: 'delete_task', description: 'can delete tasks', category: 'tasks' },
  // feedback
  { name: 'create_feedback', description: 'can create feedback (issues/suggestions)', category: 'feedback' },
  { name: 'vote_feedback', description: 'can vote on feedback', category: 'feedback' },
  { name: 'close_feedback', description: 'can close/resolve feedback', category: 'feedback' },
  // house rules
  { name: 'propose_rule', description: 'can propose new rules', category: 'rules' },
  { name: 'vote_rule', description: 'can vote on rule proposals', category: 'rules' },
  { name: 'modify_rules', description: 'can edit existing rules', category: 'rules' },
  // shared items
  { name: 'add_item', description: 'can add shared items', category: 'items' },
  { name: 'update_item', description: 'can update shared items', category: 'items' },
  { name: 'delete_items', description: 'can delete shared items', category: 'items' },
  // presence
  { name: 'update_own_presence', description: 'can update own presence status', category: 'presence' },
  // room management
  { name: 'edit_room', description: 'can edit room details', category: 'room' },
  { name: 'delete_room', description: 'can delete the room', category: 'room' },
  { name: 'transfer_ownership', description: 'can transfer room ownership', category: 'room' },
  { name: 'rotate_invite_code', description: 'can rotate room invite code', category: 'room' },
];

const adminPermissions = [
  'invite_guests',
  'create_task', 'update_task', 'complete_task', 'delete_task',
  'create_feedback', 'vote_feedback', 'close_feedback',
  'propose_rule', 'vote_rule', 'modify_rules',
  'add_item', 'update_item', 'delete_items',
  'update_own_presence',
  'edit_room',
];

const memberPermissions = [
  'invite_guests',
  'complete_task',
  'create_feedback', 'vote_feedback',
  'propose_rule', 'vote_rule',
  'update_item',
  'update_own_presence',
];

const guestPermissions = [
  'update_item',
  'update_own_presence',
];

function buildRolePermissionMappings(rolesMap, permissionsMap) {
  const mappings = [];
  const allPermissionNames = defaultPermissions.map((p) => p.name);

  const ownerId = rolesMap.get('owner');
  if (ownerId) {
    for (const permName of allPermissionNames) {
      const permId = permissionsMap.get(permName);
      if (permId) mappings.push({ roleId: ownerId, permissionId: permId });
    }
  }

  const adminId = rolesMap.get('admin');
  if (adminId) {
    for (const permName of adminPermissions) {
      const permId = permissionsMap.get(permName);
      if (permId) mappings.push({ roleId: adminId, permissionId: permId });
    }
  }

  const memberId = rolesMap.get('member');
  if (memberId) {
    for (const permName of memberPermissions) {
      const permId = permissionsMap.get(permName);
      if (permId) mappings.push({ roleId: memberId, permissionId: permId });
    }
  }

  const guestId = rolesMap.get('guest');
  if (guestId) {
    for (const permName of guestPermissions) {
      const permId = permissionsMap.get(permName);
      if (permId) mappings.push({ roleId: guestId, permissionId: permId });
    }
  }

  return mappings;
}

export async function seedDatabase() {
  const existingRole = await Role.findOne();
  if (existingRole) {
    console.log('Database already seeded, skipping...');
    return;
  }

  console.log('Seeding database...');

  const insertedRoles = await Role.bulkCreate(defaultRoles, { returning: true });
  const rolesMap = new Map(insertedRoles.map((r) => [r.name, r.id]));
  console.log(`Inserted ${insertedRoles.length} roles`);

  const insertedPermissions = await Permission.bulkCreate(defaultPermissions, { returning: true });
  const permissionsMap = new Map(insertedPermissions.map((p) => [p.name, p.id]));
  console.log(`Inserted ${insertedPermissions.length} permissions`);

  const rolePerm = buildRolePermissionMappings(rolesMap, permissionsMap);
  await RolePermission.bulkCreate(rolePerm);
  console.log(`Inserted ${rolePerm.length} role-permission mappings`);

  console.log('Database seeding complete!');
}
