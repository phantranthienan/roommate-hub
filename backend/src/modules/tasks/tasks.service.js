import { Task, RoomMember } from '../../db/index.js';
import { Op } from 'sequelize';
import { NotFoundError, BadRequestError, ForbiddenError } from '../../errors/index.js';
import { getRoomMember, getUserHierarchyLevel } from '../../utils/permissions.js';

async function listTasks(roomId, filters = {}) {
  const where = { roomId };

  if (filters.status) where.status = filters.status;

  const result = await Task.findAll({
    where,
    order: [
      ['dueDate', 'ASC'],
      ['createdAt', 'DESC'],
    ],
  });

  return result.map((t) => t.get({ plain: true }));
}

async function createTask(roomId, creatorUserId, input) {
  const creatorMember = await getRoomMember(creatorUserId, roomId);

  let assignedToMemberId;
  if (input.assignedTo) {
    const assignee = await RoomMember.findOne({
      where: {
        id: input.assignedTo,
        roomId,
        isActive: true,
        [Op.or]: [{ expiresAt: null }, { expiresAt: { [Op.gt]: new Date() } }],
      },
    });

    if (!assignee) {
      throw new BadRequestError('Assignee is not a valid room member');
    }
    assignedToMemberId = assignee.id;
  }

  const task = await Task.create({
    roomId,
    createdBy: creatorMember.id,
    assignedTo: assignedToMemberId,
    title: input.title,
    description: input.description,
    dueDate: input.dueDate,
  });

  return task.get({ plain: true });
}

async function updateTask(roomId, taskId, input) {
  const task = await Task.findOne({ where: { id: taskId, roomId } });
  if (!task) throw new NotFoundError('Task');

  if (task.status === 'done') {
    throw new BadRequestError('Cannot update a done task. Renew it first.');
  }

  if (input.assignedTo) {
    const assignee = await RoomMember.findOne({
      where: {
        id: input.assignedTo,
        roomId,
        isActive: true,
        [Op.or]: [{ expiresAt: null }, { expiresAt: { [Op.gt]: new Date() } }],
      },
    });

    if (!assignee) {
      throw new BadRequestError('Assignee is not a valid room member');
    }
  }

  await task.update({ ...input, updatedAt: new Date() });

  return task.get({ plain: true });
}

async function deleteTask(roomId, taskId) {
  const task = await Task.findOne({ where: { id: taskId, roomId } });

  if (!task) {
    throw new NotFoundError('Task');
  }

  await task.destroy();
  return { success: true };
}

async function markDone(roomId, taskId, userId) {
  const task = await Task.findOne({ where: { id: taskId, roomId } });
  if (!task) throw new NotFoundError('Task');

  if (task.status === 'done') {
    throw new BadRequestError('Task is already done');
  }

  const member = await getRoomMember(userId, roomId);
  const hierarchyLevel = await getUserHierarchyLevel(userId, roomId);
  const isAdminOrAbove = hierarchyLevel >= 75;

  if (!isAdminOrAbove && task.assignedTo !== member.id) {
    throw new ForbiddenError('You can only complete tasks assigned to you');
  }

  await task.update({ status: 'done', updatedAt: new Date() });

  return task.get({ plain: true });
}

async function renewTask(roomId, taskId, input) {
  const task = await Task.findOne({ where: { id: taskId, roomId } });
  if (!task) throw new NotFoundError('Task');

  if (task.status !== 'done') {
    throw new BadRequestError('Only done tasks can be renewed');
  }

  if (input.assignedTo) {
    const assignee = await RoomMember.findOne({
      where: {
        id: input.assignedTo,
        roomId,
        isActive: true,
        [Op.or]: [{ expiresAt: null }, { expiresAt: { [Op.gt]: new Date() } }],
      },
    });
    if (!assignee) {
      throw new BadRequestError('Assignee is not a valid room member');
    }
  }

  const updateData = {
    status: 'pending',
    dueDate: input.dueDate,
    updatedAt: new Date(),
  };

  if (input.assignedTo !== undefined) {
    updateData.assignedTo = input.assignedTo;
  }

  await task.update(updateData);

  return task.get({ plain: true });
}

export {
  listTasks,
  createTask,
  updateTask,
  deleteTask,
  markDone,
  renewTask,
};
