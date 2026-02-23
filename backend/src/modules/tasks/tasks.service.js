import { Op } from 'sequelize';
import { Task, RoomMember } from '../../db/index.js';
import { NotFoundError, BadRequestError } from '../../errors/index.js';
import { getRoomMember } from '../../utils/permissions.js';

async function listTasks(roomId, filters = {}) {
  const where = { roomId };

  if (filters.status) where.status = filters.status;
  if (filters.assignedTo) where.assignedTo = filters.assignedTo;
  if (filters.priority) where.priority = filters.priority;
  if (filters.dueBefore) where.dueDate = { ...where.dueDate, [Op.lte]: filters.dueBefore };
  if (filters.dueAfter) where.dueDate = { ...where.dueDate, [Op.gte]: filters.dueAfter };

  const result = await Task.findAll({
    where,
    order: [['createdAt', 'DESC']],
  });

  return result.map((t) => t.get({ plain: true }));
}

async function getTask(roomId, taskId) {
  const task = await Task.findOne({
    where: { id: taskId, roomId },
  });

  if (!task) {
    throw new NotFoundError('Task');
  }

  return task.get({ plain: true });
}

async function createTask(roomId, creatorUserId, input) {
  const creatorMember = await getRoomMember(creatorUserId, roomId);

  let assignedToMemberId;
  if (input.assignedTo) {
    const assignee = await RoomMember.findOne({
      where: { id: input.assignedTo, roomId, isActive: true },
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
    dueTime: input.dueTime,
    priority: input.priority || 'medium',
    isRecurring: input.isRecurring || false,
    recurrencePattern: input.recurrencePattern,
    recurrenceEndDate: input.recurrenceEndDate,
  });

  return task.get({ plain: true });
}

async function updateTask(roomId, taskId, input) {
  if (input.assignedTo) {
    const assignee = await RoomMember.findOne({
      where: { id: input.assignedTo, roomId, isActive: true },
    });

    if (!assignee) {
      throw new BadRequestError('Assignee is not a valid room member');
    }
  }

  const [affectedCount, affectedRows] = await Task.update(
    { ...input, updatedAt: new Date() },
    { where: { id: taskId, roomId }, returning: true }
  );

  if (affectedCount === 0) {
    throw new NotFoundError('Task');
  }

  return affectedRows[0].get({ plain: true });
}

async function deleteTask(roomId, taskId) {
  const task = await Task.findOne({ where: { id: taskId, roomId } });

  if (!task) {
    throw new NotFoundError('Task');
  }

  await task.destroy();
  return { success: true };
}

async function assignTask(roomId, taskId, assignedToMemberId) {
  const assignee = await RoomMember.findOne({
    where: { id: assignedToMemberId, roomId, isActive: true },
  });

  if (!assignee) {
    throw new BadRequestError('Assignee is not a valid room member');
  }

  const [affectedCount, affectedRows] = await Task.update(
    { assignedTo: assignedToMemberId, updatedAt: new Date() },
    { where: { id: taskId, roomId }, returning: true }
  );

  if (affectedCount === 0) {
    throw new NotFoundError('Task');
  }

  return affectedRows[0].get({ plain: true });
}

async function startTask(roomId, taskId) {
  const [affectedCount, affectedRows] = await Task.update(
    { status: 'in_progress', updatedAt: new Date() },
    { where: { id: taskId, roomId, status: 'pending' }, returning: true }
  );

  if (affectedCount === 0) {
    throw new NotFoundError('Task or task is not in pending status');
  }

  return affectedRows[0].get({ plain: true });
}

async function completeTask(roomId, taskId, completedByUserId) {
  const completerMember = await getRoomMember(completedByUserId, roomId);

  const [affectedCount, affectedRows] = await Task.update(
    {
      status: 'completed',
      completedAt: new Date(),
      completedBy: completerMember.id,
      updatedAt: new Date(),
    },
    { where: { id: taskId, roomId }, returning: true }
  );

  if (affectedCount === 0) {
    throw new NotFoundError('Task');
  }

  return affectedRows[0].get({ plain: true });
}

async function updateTaskStatus(roomId, taskId, status) {
  const task = await Task.findOne({ where: { id: taskId, roomId } });
  if (!task) throw new NotFoundError('Task not found');
  await task.update({ status });
  return task.get({ plain: true });
}

async function cancelTask(roomId, taskId) {
  const [affectedCount, affectedRows] = await Task.update(
    { status: 'cancelled', updatedAt: new Date() },
    { where: { id: taskId, roomId }, returning: true }
  );

  if (affectedCount === 0) {
    throw new NotFoundError('Task');
  }

  return affectedRows[0].get({ plain: true });
}

export {
  listTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  assignTask,
  startTask,
  completeTask,
  cancelTask,
  updateTaskStatus,
};
