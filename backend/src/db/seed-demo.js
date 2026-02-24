import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { Op } from 'sequelize';
import { env } from '../config/env.js';
import {
  sequelize,
  User,
  Room,
  Role,
  RoomMember,
  Task,
  Feedback,
  FeedbackVote,
  HouseRule,
  RuleVote,
  SharedItem,
  SharedItemHistory,
  GuestInvitation,
} from './index.js';
import { seedDatabase } from './seed.js';

const DEMO_PASSWORD =  '12345678';
const CROSS_ROOM_USERNAME = 'cross_room_member';
const GUEST_ONLY_USERNAME = 'guest_member';

const ROOM_DEFS = [
  {
    key: 'sunrise',
    name: 'Sunrise Apartment',
    description: 'Room A',
    inviteCode: 'SUNRISE2026',
    users: {
      owner: 'sunrise_owner',
      admin: 'sunrise_admin',
      member1: 'sunrise_member1',
      member2: 'sunrise_member2',
    },
  },
  {
    key: 'oak',
    name: 'Oak House',
    description: 'Room B',
    inviteCode: 'OAKHOUSE2026',
    users: {
      owner: 'oak_owner',
      admin: 'oak_admin',
      member1: 'oak_member1',
      member2: 'oak_member2',
    },
  },
];

const BASE_USER_DEFS = [
  { username: 'sunrise_owner', firstName: 'Alice', lastName: 'Sun', roomKey: 'sunrise', role: 'owner', present: true },
  { username: 'sunrise_admin', firstName: 'Brandon', lastName: 'Ray', roomKey: 'sunrise', role: 'admin', present: true },
  { username: 'sunrise_member1', firstName: 'Chloe', lastName: 'Hill', roomKey: 'sunrise', role: 'member', present: false },
  { username: 'sunrise_member2', firstName: 'Daniel', lastName: 'Park', roomKey: 'sunrise', role: 'member', present: false },
  { username: 'oak_owner', firstName: 'Evelyn', lastName: 'Oak', roomKey: 'oak', role: 'owner', present: true },
  { username: 'oak_admin', firstName: 'Felix', lastName: 'Stone', roomKey: 'oak', role: 'admin', present: true },
  { username: 'oak_member1', firstName: 'Grace', lastName: 'Woods', roomKey: 'oak', role: 'member', present: false },
  { username: 'oak_member2', firstName: 'Henry', lastName: 'Lake', roomKey: 'oak', role: 'member', present: false },
];

const CROSS_ROOM_USER_DEF = {
  username: CROSS_ROOM_USERNAME,
  firstName: 'Ivy',
  lastName: 'Cross',
};

const GUEST_ONLY_USER_DEF = {
  username: GUEST_ONLY_USERNAME,
  firstName: 'Taylor',
  lastName: 'Guest',
};

const MEMBERSHIP_DEFS = [
  ...BASE_USER_DEFS.map((u) => ({
    username: u.username,
    roomKey: u.roomKey,
    role: u.role,
    present: u.present,
  })),
  { username: CROSS_ROOM_USERNAME, roomKey: 'sunrise', role: 'member', present: false },
  { username: CROSS_ROOM_USERNAME, roomKey: 'oak', role: 'member', present: false },
];

const RESET_TABLES = [
  'rule_votes',
  'feedback_votes',
  'shared_item_history',
  'guest_invitations',
  'tasks',
  'feedback',
  'house_rules',
  'shared_items',
  'room_members',
  'rooms',
  'users',
];

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function isoDateWithOffset(dayOffset) {
  const d = new Date();
  d.setUTCHours(12, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() + dayOffset);
  return d.toISOString().slice(0, 10);
}

async function truncateAppData(transaction) {
  const quoted = RESET_TABLES.map((t) => `"${t}"`).join(', ');
  await sequelize.query(
    `TRUNCATE TABLE ${quoted} RESTART IDENTITY CASCADE;`,
    { transaction }
  );
}

function getRoleMap(rows) {
  return new Map(rows.map((r) => [r.name, r]));
}

function getRoomContext(roomDef, roomsByKey, membersByRoomAndUsername) {
  const memberKey = (username) => `${roomDef.key}:${username}`;

  return {
    room: roomsByKey.get(roomDef.key),
    owner: membersByRoomAndUsername.get(memberKey(roomDef.users.owner)),
    admin: membersByRoomAndUsername.get(memberKey(roomDef.users.admin)),
    member1: membersByRoomAndUsername.get(memberKey(roomDef.users.member1)),
    member2: membersByRoomAndUsername.get(memberKey(roomDef.users.member2)),
  };
}

async function seedRoomScenario(roomDef, ctx, transaction) {
  const now = new Date();

  // Task scenarios — each member has 1 pending + 1 completed
  // owner:   pending (mop floors), completed (fix faucet)
  // admin:   pending (take out recycling), completed (vacuum living room)
  // member1: pending (clean kitchen), completed (laundry room cleanup)
  // member2: pending (bathroom deep clean), completed (organize pantry)
  // + 1 unassigned task, 1 overdue task
  const taskRows = await Task.bulkCreate(
    [
      // — owner tasks —
      {
        roomId: ctx.room.id,
        createdBy: ctx.admin.id,
        assignedTo: ctx.owner.id,
        title: 'Mop hallway and entrance',
        description: 'Use the new microfiber mop in the closet.',
        dueDate: isoDateWithOffset(2),
        dueTime: '18:00:00',
        priority: 'medium',
        status: 'pending',
      },
      {
        roomId: ctx.room.id,
        createdBy: ctx.owner.id,
        assignedTo: ctx.owner.id,
        title: 'Fix leaky kitchen faucet',
        description: 'Replaced washer and tightened handle.',
        dueDate: isoDateWithOffset(-4),
        priority: 'high',
        status: 'completed',
        completedAt: addDays(now, -3),
        completedBy: ctx.owner.id,
      },
      // — admin tasks —
      {
        roomId: ctx.room.id,
        createdBy: ctx.owner.id,
        assignedTo: ctx.admin.id,
        title: 'Take out recycling',
        description: 'Blue bin pickup is tomorrow morning.',
        dueDate: isoDateWithOffset(0),
        dueTime: '21:00:00',
        priority: 'medium',
        status: 'pending',
      },
      {
        roomId: ctx.room.id,
        createdBy: ctx.member1.id,
        assignedTo: ctx.admin.id,
        title: 'Vacuum living room',
        description: 'Focus under sofa and TV stand.',
        dueDate: isoDateWithOffset(-2),
        dueTime: '18:30:00',
        priority: 'low',
        status: 'completed',
        completedAt: addDays(now, -1),
        completedBy: ctx.admin.id,
      },
      // — member1 tasks —
      {
        roomId: ctx.room.id,
        createdBy: ctx.owner.id,
        assignedTo: ctx.member1.id,
        title: 'Clean kitchen counters',
        description: 'Wipe counters and stove after dinner.',
        dueDate: isoDateWithOffset(1),
        dueTime: '19:00:00',
        priority: 'high',
        status: 'pending',
      },
      {
        roomId: ctx.room.id,
        createdBy: ctx.member2.id,
        assignedTo: ctx.member1.id,
        title: 'Laundry room cleanup',
        description: 'Sort lost socks and clear lint around dryer.',
        dueDate: isoDateWithOffset(-3),
        dueTime: '17:00:00',
        priority: 'low',
        status: 'completed',
        completedAt: addDays(now, -2),
        completedBy: ctx.member1.id,
      },
      // — member2 tasks —
      {
        roomId: ctx.room.id,
        createdBy: ctx.admin.id,
        assignedTo: ctx.member2.id,
        title: 'Weekly bathroom deep clean',
        description: 'Recurring weekly rotation task.',
        dueDate: isoDateWithOffset(1),
        priority: 'high',
        isRecurring: true,
        recurrencePattern: 'weekly',
        recurrenceEndDate: isoDateWithOffset(30),
        status: 'pending',
      },
      {
        roomId: ctx.room.id,
        createdBy: ctx.owner.id,
        assignedTo: ctx.member2.id,
        title: 'Organize pantry shelves',
        description: 'Group items by category and check expiration dates.',
        dueDate: isoDateWithOffset(-1),
        priority: 'medium',
        status: 'completed',
        completedAt: now,
        completedBy: ctx.member2.id,
      },
      // — unassigned task —
      {
        roomId: ctx.room.id,
        createdBy: ctx.owner.id,
        assignedTo: null,
        title: 'Replace hallway light bulb',
        description: 'Use warm white spare bulb from drawer.',
        dueDate: isoDateWithOffset(3),
        dueTime: '20:00:00',
        priority: 'medium',
        status: 'pending',
      },
      // — overdue task (member1, demonstrates red due label) —
      {
        roomId: ctx.room.id,
        createdBy: ctx.admin.id,
        assignedTo: ctx.member1.id,
        title: 'Wipe down window sills',
        description: 'Dust and wipe all bedroom and living room sills.',
        dueDate: isoDateWithOffset(-2),
        dueTime: '15:00:00',
        priority: 'low',
        status: 'pending',
      },
    ],
    { returning: true, transaction }
  );

  // Feedback scenarios:
  // 0. Open issue with many votes — demonstrates resolve button for admin
  // 1. Open suggestion with few votes — demonstrates reject button for admin
  // 2. Done suggestion — resolved example
  // 3. Rejected issue — rejected example
  const feedbackRows = await Feedback.bulkCreate(
    [
      {
        roomId: ctx.room.id,
        createdBy: ctx.member1.id,
        type: 'issue',
        title: 'Wi-Fi drops at night',
        description: 'Internet disconnects around midnight for 10-15 minutes.',
        status: 'open',
      },
      {
        roomId: ctx.room.id,
        createdBy: ctx.member2.id,
        type: 'suggestion',
        title: 'Buy second drying rack',
        description: 'Current rack is always occupied on weekends.',
        status: 'open',
      },
      {
        roomId: ctx.room.id,
        createdBy: ctx.admin.id,
        type: 'suggestion',
        title: 'Shared calendar for chores',
        description: 'Use one Google Calendar with recurring reminders.',
        status: 'done',
        closedAt: addDays(now, -1),
      },
      {
        roomId: ctx.room.id,
        createdBy: ctx.owner.id,
        type: 'issue',
        title: 'Noise after 11pm',
        description: 'Late calls in living room are disturbing sleep.',
        status: 'rejected',
        closedAt: addDays(now, -2),
      },
    ],
    { returning: true, transaction }
  );

  await FeedbackVote.bulkCreate(
    [
      // Feedback 0 — open issue, 3 votes (popular, ready to resolve)
      { feedbackId: feedbackRows[0].id, roomMemberId: ctx.owner.id },
      { feedbackId: feedbackRows[0].id, roomMemberId: ctx.admin.id },
      { feedbackId: feedbackRows[0].id, roomMemberId: ctx.member2.id },
      // Feedback 1 — open suggestion, 1 vote (low traction, candidate for reject)
      { feedbackId: feedbackRows[1].id, roomMemberId: ctx.member2.id },
      // Feedback 2 — done, had a vote
      { feedbackId: feedbackRows[2].id, roomMemberId: ctx.owner.id },
      // Feedback 3 — rejected, had votes
      { feedbackId: feedbackRows[3].id, roomMemberId: ctx.admin.id },
      { feedbackId: feedbackRows[3].id, roomMemberId: ctx.member1.id },
    ],
    { transaction }
  );

  // Rule scenarios (5 active members per room → majority = 3)
  // 1. Proposed, enough votes (3), created 2 days ago → Approve button for owner/admin
  // 2. Proposed, not enough votes (1), created 6 hours ago → no action (within 24h grace)
  // 3. Proposed, not enough votes (1), created 3 days ago → Reject button for owner/admin
  // 4. Approved, partially accepted → Accept button for non-accepters
  // 5. Approved, fully accepted → green check
  // 6. Rejected → rejected badge
  const ruleRows = await HouseRule.bulkCreate(
    [
      {
        roomId: ctx.room.id,
        proposedBy: ctx.owner.id,
        title: 'Quiet hours after 10 PM',
        description: 'Use headphones and keep calls in bedrooms after 10 PM.',
        category: 'noise',
        status: 'proposed',
        displayOrder: 1,
        createdAt: addDays(now, -2),
        votingDeadline: addDays(now, 5),
      },
      {
        roomId: ctx.room.id,
        proposedBy: ctx.member2.id,
        title: 'Label all food in the fridge',
        description: 'Put your name and date on any food stored in the shared fridge.',
        category: 'cleanliness',
        status: 'proposed',
        displayOrder: 2,
        createdAt: new Date(now.getTime() - 6 * 60 * 60 * 1000), // 6 hours ago
      },
      {
        roomId: ctx.room.id,
        proposedBy: ctx.member1.id,
        title: 'No shoes inside the apartment',
        description: 'Remove shoes at the entrance to keep floors clean.',
        category: 'cleanliness',
        status: 'proposed',
        displayOrder: 3,
        createdAt: addDays(now, -3),
        votingDeadline: addDays(now, 4),
      },
      {
        roomId: ctx.room.id,
        proposedBy: ctx.admin.id,
        title: 'Trash schedule on Tuesdays',
        description: 'Assigned person must take trash and recycling out every Tuesday night.',
        category: 'cleanliness',
        status: 'approved',
        displayOrder: 4,
        createdAt: addDays(now, -10),
        approvedAt: addDays(now, -3),
      },
      {
        roomId: ctx.room.id,
        proposedBy: ctx.member2.id,
        title: 'Weekly deep clean every Sunday',
        description: 'Everyone contributes 45 minutes to deep cleaning on Sunday.',
        category: 'cleanliness',
        status: 'approved',
        displayOrder: 5,
        createdAt: addDays(now, -7),
        approvedAt: addDays(now, -1),
      },
      {
        roomId: ctx.room.id,
        proposedBy: ctx.member1.id,
        title: 'No overnight guests on weekdays',
        description: 'Disallow overnight guests Sunday to Thursday.',
        category: 'guests',
        status: 'rejected',
        displayOrder: 6,
        createdAt: addDays(now, -5),
      },
    ],
    { returning: true, transaction }
  );

  await RuleVote.bulkCreate(
    [
      // Rule 0 — proposed, 3 votes (enough) → Approve button
      { ruleId: ruleRows[0].id, roomMemberId: ctx.admin.id },
      { ruleId: ruleRows[0].id, roomMemberId: ctx.member1.id },
      { ruleId: ruleRows[0].id, roomMemberId: ctx.member2.id },
      // Rule 1 — proposed, 1 vote, < 24h old → no action
      { ruleId: ruleRows[1].id, roomMemberId: ctx.member2.id },
      // Rule 2 — proposed, 1 vote, > 24h old → Reject button
      { ruleId: ruleRows[2].id, roomMemberId: ctx.member1.id },
      // Rule 3 — approved
      { ruleId: ruleRows[3].id, roomMemberId: ctx.owner.id },
      { ruleId: ruleRows[3].id, roomMemberId: ctx.admin.id },
      { ruleId: ruleRows[3].id, roomMemberId: ctx.member1.id },
      // Rule 4 — approved
      { ruleId: ruleRows[4].id, roomMemberId: ctx.owner.id },
      { ruleId: ruleRows[4].id, roomMemberId: ctx.admin.id },
      { ruleId: ruleRows[4].id, roomMemberId: ctx.member2.id },
      // Rule 5 — rejected, had some votes
      { ruleId: ruleRows[5].id, roomMemberId: ctx.member1.id },
    ],
    { transaction }
  );

  const itemRows = await SharedItem.bulkCreate(
    [
      {
        roomId: ctx.room.id,
        name: 'Toilet Paper',
        category: 'Bathroom',
        status: 'low',
        lastPurchasedBy: ctx.member1.id,
        lastPurchasedAt: addDays(now, -3),
      },
      {
        roomId: ctx.room.id,
        name: 'Dish Soap',
        category: 'Kitchen',
        status: 'available',
        lastPurchasedBy: ctx.admin.id,
        lastPurchasedAt: addDays(now, -1),
      },
      {
        roomId: ctx.room.id,
        name: 'Milk',
        category: 'Fridge',
        status: 'out_of_stock',
      },
      {
        roomId: ctx.room.id,
        name: 'Trash Bags',
        category: 'Cleaning',
        status: 'low',
        lastPurchasedBy: ctx.owner.id,
        lastPurchasedAt: addDays(now, -5),
      },
      {
        roomId: ctx.room.id,
        name: 'Sponges',
        category: 'Kitchen',
        status: 'available',
        lastPurchasedBy: ctx.member2.id,
        lastPurchasedAt: addDays(now, -2),
      },
    ],
    { returning: true, transaction }
  );

  await SharedItemHistory.bulkCreate(
    [
      {
        itemId: itemRows[0].id,
        purchasedBy: ctx.member1.id,
        quantity: 12,
        price: '8.99',
        currency: 'USD',
        notes: 'Bulk pack from warehouse store',
        purchasedAt: addDays(now, -3),
      },
      {
        itemId: itemRows[1].id,
        purchasedBy: ctx.admin.id,
        quantity: 2,
        price: '6.5',
        currency: 'USD',
        notes: 'Lemon scent',
        purchasedAt: addDays(now, -1),
      },
      {
        itemId: itemRows[3].id,
        purchasedBy: ctx.owner.id,
        quantity: 1,
        price: '9.25',
        currency: 'USD',
        notes: 'Drawstring bags 40L',
        purchasedAt: addDays(now, -5),
      },
    ],
    { transaction }
  );

  await GuestInvitation.bulkCreate(
    [
      {
        roomId: ctx.room.id,
        invitedBy: ctx.owner.id,
        guestUsername: `${roomDef.key}-guest-active`,
        invitationCode: `${roomDef.key.toUpperCase()}-GUEST-ACTIVE`,
        validFrom: addDays(now, -1),
        validUntil: addDays(now, 14),
        isActive: true,
      },
      {
        roomId: ctx.room.id,
        invitedBy: ctx.owner.id,
        guestUsername: `${roomDef.key}-guest-expired`,
        invitationCode: `${roomDef.key.toUpperCase()}-GUEST-EXPIRED`,
        validFrom: addDays(now, -20),
        validUntil: addDays(now, -2),
        isActive: true,
      },
    ],
    { transaction }
  );

  return {
    tasks: taskRows.length,
    feedback: feedbackRows.length,
    rules: ruleRows.length,
    items: itemRows.length,
  };
}

async function seedDemoDataset() {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, env.BCRYPT_ROUNDS);

  return sequelize.transaction(async (transaction) => {
    await truncateAppData(transaction);

    const roles = await Role.findAll({
      where: { name: { [Op.in]: ['owner', 'admin', 'member'] } },
      transaction,
    });
    const rolesByName = getRoleMap(roles);

    for (const roleName of ['owner', 'admin', 'member']) {
      if (!rolesByName.get(roleName)) {
        throw new Error(`Role "${roleName}" not found. Run base RBAC seed first.`);
      }
    }

    const usersByUsername = new Map();
    const allUsers = [
      ...BASE_USER_DEFS.map((u) => ({
        username: u.username,
        firstName: u.firstName,
        lastName: u.lastName,
      })),
      CROSS_ROOM_USER_DEF,
      GUEST_ONLY_USER_DEF,
    ];

    for (const u of allUsers) {
      const user = await User.create(
        {
          username: u.username,
          passwordHash,
          firstName: u.firstName,
          lastName: u.lastName,
        },
        { transaction }
      );
      usersByUsername.set(u.username, user);
    }

    const roomsByKey = new Map();
    for (const r of ROOM_DEFS) {
      const room = await Room.create(
        {
          name: r.name,
          description: r.description,
          inviteCode: r.inviteCode,
        },
        { transaction }
      );
      roomsByKey.set(r.key, room);
    }

    const membersByRoomAndUsername = new Map();
    const now = new Date();
    for (const m of MEMBERSHIP_DEFS) {
      const role = rolesByName.get(m.role);
      const room = roomsByKey.get(m.roomKey);
      const user = usersByUsername.get(m.username);
      const mapKey = `${m.roomKey}:${m.username}`;

      const member = await RoomMember.create(
        {
          roomId: room.id,
          userId: user.id,
          roleId: role.id,
          joinedAt: addDays(now, -7),
          isActive: true,
          isPresent: m.present,
          presenceUpdatedAt: now,
        },
        { transaction }
      );
      membersByRoomAndUsername.set(mapKey, member);
    }

    let scenarioTotals = {
      tasks: 0,
      feedback: 0,
      rules: 0,
      items: 0,
    };

    for (const roomDef of ROOM_DEFS) {
      const ctx = getRoomContext(roomDef, roomsByKey, membersByRoomAndUsername);
      const totals = await seedRoomScenario(roomDef, ctx, transaction);
      scenarioTotals = {
        tasks: scenarioTotals.tasks + totals.tasks,
        feedback: scenarioTotals.feedback + totals.feedback,
        rules: scenarioTotals.rules + totals.rules,
        items: scenarioTotals.items + totals.items,
      };
    }

    const counts = {
      users: await User.count({ transaction }),
      rooms: await Room.count({ transaction }),
      members: await RoomMember.count({ transaction }),
      tasks: await Task.count({ transaction }),
      feedback: await Feedback.count({ transaction }),
      feedbackVotes: await FeedbackVote.count({ transaction }),
      rules: await HouseRule.count({ transaction }),
      ruleVotes: await RuleVote.count({ transaction }),
      items: await SharedItem.count({ transaction }),
      itemHistory: await SharedItemHistory.count({ transaction }),
      guestInvitations: await GuestInvitation.count({ transaction }),
    };

    return {
      counts,
      scenarioTotals,
    };
  });
}

function printSummary(summary) {
  console.log('\nDemo dataset seeded successfully.');
  console.log('--------------------------------');
  console.log(`Shared password: ${DEMO_PASSWORD}`);
  console.log('Usernames:');
  for (const room of ROOM_DEFS) {
    console.log(`  ${room.name}:`);
    console.log(`    - ${room.users.owner}`);
    console.log(`    - ${room.users.admin}`);
    console.log(`    - ${room.users.member1}`);
    console.log(`    - ${room.users.member2}`);
    console.log(`    - ${CROSS_ROOM_USERNAME} (also in other room)`);
  }
  console.log(`  Standalone guest candidate: ${GUEST_ONLY_USERNAME} (no room membership)`);
  console.log('--------------------------------');
  console.log('Inserted rows:');
  Object.entries(summary.counts).forEach(([key, value]) => {
    console.log(`  ${key}: ${value}`);
  });
  console.log('--------------------------------\n');
}

async function run() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Refusing to seed demo data in production.');
  }

  sequelize.options.logging = false;

  await sequelize.authenticate();
  console.log('Database connected.');

  await sequelize.sync({ alter: true, logging: false });
  console.log('Database synced.');

  await seedDatabase();
  console.log('RBAC baseline ensured.');

  const summary = await seedDemoDataset();
  printSummary(summary);

  await sequelize.close();
}

run()
  .catch(async (error) => {
    console.error('Failed to seed demo dataset:', error);
    try {
      await sequelize.close();
    } catch {
      // no-op
    }
    process.exit(1);
  });
