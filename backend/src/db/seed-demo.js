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
  RuleAcceptance,
  SharedItem,
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
  { username: 'sunrise_admin', firstName: 'Brandon', lastName: 'Ray', roomKey: 'sunrise', role: 'admin', present: false },
  { username: 'sunrise_member1', firstName: 'Chloe', lastName: 'Hill', roomKey: 'sunrise', role: 'member', present: true },
  { username: 'sunrise_member2', firstName: 'Daniel', lastName: 'Park', roomKey: 'sunrise', role: 'member', present: false },
  { username: 'oak_owner', firstName: 'Evelyn', lastName: 'Oak', roomKey: 'oak', role: 'owner', present: false },
  { username: 'oak_admin', firstName: 'Felix', lastName: 'Stone', roomKey: 'oak', role: 'admin', present: true },
  { username: 'oak_member1', firstName: 'Grace', lastName: 'Woods', roomKey: 'oak', role: 'member', present: false },
  { username: 'oak_member2', firstName: 'Henry', lastName: 'Lake', roomKey: 'oak', role: 'member', present: true },
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
  // sunrise_owner is also a regular member in oak room (owner in one room, member in another)
  { username: 'sunrise_owner', roomKey: 'oak', role: 'member', present: false },
];

const RESET_TABLES = [
  'rule_acceptances',
  'rule_votes',
  'feedback_votes',
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

// ---------------------------------------------------------------------------
// Sunrise Apartment — urban apartment living theme
// ---------------------------------------------------------------------------
async function seedSunriseScenario(ctx, transaction) {
  const now = new Date();

  const taskRows = await Task.bulkCreate(
    [
      {
        roomId: ctx.room.id,
        createdBy: ctx.admin.id,
        assignedTo: ctx.owner.id,
        title: 'Clean kitchen counters',
        description: 'Wipe down all counters with disinfectant spray.',
        dueDate: isoDateWithOffset(2),
        status: 'pending',
      },
      {
        roomId: ctx.room.id,
        createdBy: ctx.owner.id,
        assignedTo: ctx.admin.id,
        title: 'Take out recycling',
        description: 'Blue bin pickup is tomorrow morning.',
        dueDate: isoDateWithOffset(0),
        status: 'pending',
      },
      {
        roomId: ctx.room.id,
        createdBy: ctx.member1.id,
        assignedTo: ctx.member2.id,
        title: 'Unclog bathroom drain',
        description: 'Hair buildup in the shower drain — use the snake tool under the sink.',
        dueDate: isoDateWithOffset(1),
        status: 'pending',
      },
      {
        roomId: ctx.room.id,
        createdBy: ctx.owner.id,
        assignedTo: ctx.member1.id,
        title: 'Wipe stovetop after cooking',
        description: 'Grease splatter from last night still on the burners.',
        dueDate: isoDateWithOffset(1),
        status: 'pending',
      },
      {
        roomId: ctx.room.id,
        createdBy: ctx.owner.id,
        assignedTo: ctx.owner.id,
        title: 'Fix leaky faucet',
        description: 'Replaced washer and tightened handle.',
        dueDate: isoDateWithOffset(-4),
        status: 'done',
      },
      {
        roomId: ctx.room.id,
        createdBy: ctx.admin.id,
        assignedTo: ctx.admin.id,
        title: 'Set up Wi-Fi extender',
        description: 'Installed in the hallway — coverage much better now.',
        dueDate: isoDateWithOffset(-3),
        status: 'done',
      },
      {
        roomId: ctx.room.id,
        createdBy: ctx.owner.id,
        assignedTo: null,
        title: 'Replace hallway light bulb',
        description: 'Use warm white spare bulb from the drawer.',
        dueDate: isoDateWithOffset(3),
        status: 'pending',
      },
      {
        roomId: ctx.room.id,
        createdBy: ctx.admin.id,
        assignedTo: ctx.member1.id,
        title: 'Scrub shower tiles',
        description: 'Mildew building up in the corners — use the tile brush.',
        dueDate: isoDateWithOffset(-2),
        status: 'pending',
      },
    ],
    { returning: true, transaction }
  );

  const feedbackRows = await Feedback.bulkCreate(
    [
      {
        roomId: ctx.room.id,
        createdBy: ctx.member1.id,
        type: 'issue',
        title: 'Hot water runs out too fast',
        description: 'By the third shower in the morning there is barely any hot water left.',
        status: 'open',
      },
      {
        roomId: ctx.room.id,
        createdBy: ctx.member2.id,
        type: 'suggestion',
        title: 'Buy a shoe rack for the entrance',
        description: 'Shoes are piling up by the front door — a rack would keep it tidy.',
        status: 'open',
      },
      {
        roomId: ctx.room.id,
        createdBy: ctx.admin.id,
        type: 'suggestion',
        title: 'Get a shared Netflix account',
        description: 'Split 4-way, comes to ~$5/person.',
        status: 'done',
        closedAt: addDays(now, -1),
      },
      {
        roomId: ctx.room.id,
        createdBy: ctx.owner.id,
        type: 'suggestion',
        title: 'Install a dishwasher',
        description: 'Would save a lot of time on dishes.',
        status: 'rejected',
        closedAt: addDays(now, -2),
      },
    ],
    { returning: true, transaction }
  );

  await FeedbackVote.bulkCreate(
    [
      { feedbackId: feedbackRows[0].id, roomMemberId: ctx.owner.id },
      { feedbackId: feedbackRows[0].id, roomMemberId: ctx.admin.id },
      { feedbackId: feedbackRows[0].id, roomMemberId: ctx.member2.id },
      { feedbackId: feedbackRows[1].id, roomMemberId: ctx.member2.id },
      { feedbackId: feedbackRows[2].id, roomMemberId: ctx.owner.id },
      { feedbackId: feedbackRows[3].id, roomMemberId: ctx.admin.id },
      { feedbackId: feedbackRows[3].id, roomMemberId: ctx.member1.id },
    ],
    { transaction }
  );

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
        title: 'No cooking fish indoors',
        description: 'The smell lingers for days — please use outdoor grill or order out.',
        category: 'kitchen',
        status: 'proposed',
        displayOrder: 2,
        createdAt: new Date(now.getTime() - 6 * 60 * 60 * 1000),
      },
      {
        roomId: ctx.room.id,
        proposedBy: ctx.member1.id,
        title: 'Guests must leave by midnight',
        description: 'All guests should be out by 12 AM on weeknights.',
        category: 'guests',
        status: 'proposed',
        displayOrder: 3,
        createdAt: addDays(now, -3),
        votingDeadline: addDays(now, 4),
      },
      {
        roomId: ctx.room.id,
        proposedBy: ctx.admin.id,
        title: 'Take shoes off at the door',
        description: 'Remove shoes at the entrance to keep floors clean.',
        category: 'cleanliness',
        status: 'approved',
        displayOrder: 4,
        createdAt: addDays(now, -10),
        approvedAt: addDays(now, -3),
      },
      {
        roomId: ctx.room.id,
        proposedBy: ctx.member2.id,
        title: 'Clean up kitchen within 30 minutes after cooking',
        description: 'Dishes, counters, and stovetop must be cleaned within 30 min.',
        category: 'kitchen',
        status: 'approved',
        displayOrder: 5,
        createdAt: addDays(now, -7),
        approvedAt: addDays(now, -1),
      },
      {
        roomId: ctx.room.id,
        proposedBy: ctx.member1.id,
        title: 'No pets allowed',
        description: 'Lease does not permit pets — no exceptions.',
        category: 'general',
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

  // Rule acceptances for approved rules
  await RuleAcceptance.bulkCreate(
    [
      // Rule 3 — partially accepted (2 of ~5 members)
      { ruleId: ruleRows[3].id, roomMemberId: ctx.owner.id },
      { ruleId: ruleRows[3].id, roomMemberId: ctx.admin.id },
      // Rule 4 — fully accepted (all 5 active members in room)
      { ruleId: ruleRows[4].id, roomMemberId: ctx.owner.id },
      { ruleId: ruleRows[4].id, roomMemberId: ctx.admin.id },
      { ruleId: ruleRows[4].id, roomMemberId: ctx.member1.id },
      { ruleId: ruleRows[4].id, roomMemberId: ctx.member2.id },
    ],
    { transaction }
  );

  await SharedItem.bulkCreate(
    [
      { roomId: ctx.room.id, name: 'Toilet Paper', category: 'Bathroom', status: 'low' },
      { roomId: ctx.room.id, name: 'Dish Soap', category: 'Kitchen', status: 'available' },
      { roomId: ctx.room.id, name: 'Milk', category: 'Fridge', status: 'out_of_stock' },
      { roomId: ctx.room.id, name: 'Trash Bags', category: 'Cleaning', status: 'low' },
      { roomId: ctx.room.id, name: 'Paper Towels', category: 'Kitchen', status: 'available' },
    ],
    { transaction }
  );

  return { tasks: taskRows.length, feedback: feedbackRows.length, rules: ruleRows.length };
}

// ---------------------------------------------------------------------------
// Oak House — house with yard / suburban theme
// ---------------------------------------------------------------------------
async function seedOakScenario(ctx, transaction) {
  const now = new Date();

  const taskRows = await Task.bulkCreate(
    [
      {
        roomId: ctx.room.id,
        createdBy: ctx.owner.id,
        assignedTo: ctx.admin.id,
        title: 'Mow the front lawn',
        description: 'Grass is getting tall — mower is in the garage.',
        dueDate: isoDateWithOffset(2),
        status: 'pending',
      },
      {
        roomId: ctx.room.id,
        createdBy: ctx.admin.id,
        assignedTo: ctx.owner.id,
        title: 'Clean gutters',
        description: 'Leaves clogging the front gutters — ladder is in the shed.',
        dueDate: isoDateWithOffset(3),
        status: 'pending',
      },
      {
        roomId: ctx.room.id,
        createdBy: ctx.member1.id,
        assignedTo: ctx.member2.id,
        title: 'Wash dishes in sink',
        description: 'Pile has been sitting since yesterday.',
        dueDate: isoDateWithOffset(0),
        status: 'pending',
      },
      {
        roomId: ctx.room.id,
        createdBy: ctx.owner.id,
        assignedTo: ctx.member1.id,
        title: 'Sweep the porch',
        description: 'Dirt and leaves tracked in from the yard.',
        dueDate: isoDateWithOffset(1),
        status: 'pending',
      },
      {
        roomId: ctx.room.id,
        createdBy: ctx.admin.id,
        assignedTo: ctx.admin.id,
        title: 'Fix garage door opener',
        description: 'Replaced the battery in the remote — working now.',
        dueDate: isoDateWithOffset(-5),
        status: 'done',
      },
      {
        roomId: ctx.room.id,
        createdBy: ctx.owner.id,
        assignedTo: ctx.member2.id,
        title: 'Rake leaves in backyard',
        description: 'Filled three bags, put them by the curb.',
        dueDate: isoDateWithOffset(-2),
        status: 'done',
      },
      {
        roomId: ctx.room.id,
        createdBy: ctx.admin.id,
        assignedTo: null,
        title: 'Replace smoke detector batteries',
        description: 'Beeping started last night — spare 9Vs in the junk drawer.',
        dueDate: isoDateWithOffset(4),
        status: 'pending',
      },
      {
        roomId: ctx.room.id,
        createdBy: ctx.member2.id,
        assignedTo: ctx.member1.id,
        title: 'Water garden plants',
        description: 'Tomatoes and herbs are wilting — water twice daily in this heat.',
        dueDate: isoDateWithOffset(-3),
        status: 'pending',
      },
    ],
    { returning: true, transaction }
  );

  const feedbackRows = await Feedback.bulkCreate(
    [
      {
        roomId: ctx.room.id,
        createdBy: ctx.member2.id,
        type: 'issue',
        title: 'Garage light keeps flickering',
        description: 'The fluorescent tube in the garage flickers every evening.',
        status: 'open',
      },
      {
        roomId: ctx.room.id,
        createdBy: ctx.member1.id,
        type: 'suggestion',
        title: 'Start a compost bin in the backyard',
        description: 'We throw out a lot of food scraps — composting would be easy.',
        status: 'open',
      },
      {
        roomId: ctx.room.id,
        createdBy: ctx.admin.id,
        type: 'issue',
        title: 'Fix the mailbox latch',
        description: 'The mailbox door keeps swinging open in the wind.',
        status: 'done',
        closedAt: addDays(now, -1),
      },
      {
        roomId: ctx.room.id,
        createdBy: ctx.owner.id,
        type: 'suggestion',
        title: 'Build a fire pit',
        description: 'Would be nice for weekend hangouts in the backyard.',
        status: 'rejected',
        closedAt: addDays(now, -3),
      },
    ],
    { returning: true, transaction }
  );

  await FeedbackVote.bulkCreate(
    [
      { feedbackId: feedbackRows[0].id, roomMemberId: ctx.owner.id },
      { feedbackId: feedbackRows[0].id, roomMemberId: ctx.member1.id },
      { feedbackId: feedbackRows[1].id, roomMemberId: ctx.member1.id },
      { feedbackId: feedbackRows[2].id, roomMemberId: ctx.admin.id },
      { feedbackId: feedbackRows[3].id, roomMemberId: ctx.member2.id },
      { feedbackId: feedbackRows[3].id, roomMemberId: ctx.member1.id },
    ],
    { transaction }
  );

  const ruleRows = await HouseRule.bulkCreate(
    [
      {
        roomId: ctx.room.id,
        proposedBy: ctx.admin.id,
        title: 'Lock all doors by 11 PM',
        description: 'Front, back, and garage doors must be locked by 11 PM.',
        category: 'safety',
        status: 'proposed',
        displayOrder: 1,
        createdAt: addDays(now, -2),
        votingDeadline: addDays(now, 5),
      },
      {
        roomId: ctx.room.id,
        proposedBy: ctx.member1.id,
        title: 'Alternate weekly lawn mowing',
        description: 'Rotate mowing duty each week — posted schedule on fridge.',
        category: 'yard',
        status: 'proposed',
        displayOrder: 2,
        createdAt: new Date(now.getTime() - 6 * 60 * 60 * 1000),
      },
      {
        roomId: ctx.room.id,
        proposedBy: ctx.member2.id,
        title: 'No loud music after 9 PM on weekdays',
        description: 'Keep volume down Sun–Thu so everyone can sleep.',
        category: 'noise',
        status: 'proposed',
        displayOrder: 3,
        createdAt: addDays(now, -3),
        votingDeadline: addDays(now, 4),
      },
      {
        roomId: ctx.room.id,
        proposedBy: ctx.owner.id,
        title: 'Sort recycling into separate bins',
        description: 'Paper, plastic, and glass each have their own bin in the garage.',
        category: 'cleanliness',
        status: 'approved',
        displayOrder: 4,
        createdAt: addDays(now, -10),
        approvedAt: addDays(now, -3),
      },
      {
        roomId: ctx.room.id,
        proposedBy: ctx.admin.id,
        title: 'Wipe muddy shoes before entering',
        description: 'Use the mat at the back door — no mud tracked inside.',
        category: 'cleanliness',
        status: 'approved',
        displayOrder: 5,
        createdAt: addDays(now, -7),
        approvedAt: addDays(now, -1),
      },
      {
        roomId: ctx.room.id,
        proposedBy: ctx.member1.id,
        title: 'No parking on the driveway overnight',
        description: 'Driveway needs to stay clear for early-morning commuters.',
        category: 'general',
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
      { ruleId: ruleRows[0].id, roomMemberId: ctx.owner.id },
      { ruleId: ruleRows[0].id, roomMemberId: ctx.member1.id },
      { ruleId: ruleRows[0].id, roomMemberId: ctx.member2.id },
      // Rule 1 — proposed, 1 vote, < 24h old → no action
      { ruleId: ruleRows[1].id, roomMemberId: ctx.member1.id },
      // Rule 2 — proposed, 1 vote, > 24h old → Reject button
      { ruleId: ruleRows[2].id, roomMemberId: ctx.member2.id },
      // Rule 3 — approved
      { ruleId: ruleRows[3].id, roomMemberId: ctx.owner.id },
      { ruleId: ruleRows[3].id, roomMemberId: ctx.admin.id },
      { ruleId: ruleRows[3].id, roomMemberId: ctx.member2.id },
      // Rule 4 — approved
      { ruleId: ruleRows[4].id, roomMemberId: ctx.owner.id },
      { ruleId: ruleRows[4].id, roomMemberId: ctx.admin.id },
      { ruleId: ruleRows[4].id, roomMemberId: ctx.member1.id },
      // Rule 5 — rejected, had some votes
      { ruleId: ruleRows[5].id, roomMemberId: ctx.member2.id },
    ],
    { transaction }
  );

  // Rule acceptances for approved rules
  await RuleAcceptance.bulkCreate(
    [
      // Rule 3 — partially accepted (3 of ~5 members)
      { ruleId: ruleRows[3].id, roomMemberId: ctx.owner.id },
      { ruleId: ruleRows[3].id, roomMemberId: ctx.admin.id },
      { ruleId: ruleRows[3].id, roomMemberId: ctx.member2.id },
      // Rule 4 — fully accepted (all 5 active members in room)
      { ruleId: ruleRows[4].id, roomMemberId: ctx.owner.id },
      { ruleId: ruleRows[4].id, roomMemberId: ctx.admin.id },
      { ruleId: ruleRows[4].id, roomMemberId: ctx.member1.id },
      { ruleId: ruleRows[4].id, roomMemberId: ctx.member2.id },
    ],
    { transaction }
  );

  await SharedItem.bulkCreate(
    [
      { roomId: ctx.room.id, name: 'Laundry Detergent', category: 'Laundry', status: 'low' },
      { roomId: ctx.room.id, name: 'Garbage Bags', category: 'Cleaning', status: 'available' },
      { roomId: ctx.room.id, name: 'Coffee Filters', category: 'Kitchen', status: 'out_of_stock' },
      { roomId: ctx.room.id, name: 'Light Bulbs', category: 'General', status: 'available' },
      { roomId: ctx.room.id, name: 'Hand Soap', category: 'Bathroom', status: 'low' },
    ],
    { transaction }
  );

  return { tasks: taskRows.length, feedback: feedbackRows.length, rules: ruleRows.length };
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

    const sunriseDef = ROOM_DEFS.find((r) => r.key === 'sunrise');
    const oakDef = ROOM_DEFS.find((r) => r.key === 'oak');

    const sunriseCtx = getRoomContext(sunriseDef, roomsByKey, membersByRoomAndUsername);
    const oakCtx = getRoomContext(oakDef, roomsByKey, membersByRoomAndUsername);

    const sunriseTotals = await seedSunriseScenario(sunriseCtx, transaction);
    const oakTotals = await seedOakScenario(oakCtx, transaction);

    const scenarioTotals = {
      tasks: sunriseTotals.tasks + oakTotals.tasks,
      feedback: sunriseTotals.feedback + oakTotals.feedback,
      rules: sunriseTotals.rules + oakTotals.rules,
    };

    const counts = {
      users: await User.count({ transaction }),
      rooms: await Room.count({ transaction }),
      members: await RoomMember.count({ transaction }),
      tasks: await Task.count({ transaction }),
      feedback: await Feedback.count({ transaction }),
      feedbackVotes: await FeedbackVote.count({ transaction }),
      rules: await HouseRule.count({ transaction }),
      ruleVotes: await RuleVote.count({ transaction }),
      ruleAcceptances: await RuleAcceptance.count({ transaction }),
      items: await SharedItem.count({ transaction }),
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
