import { asyncHandler } from '../../middlewares/async-handler.js';
import { sendSuccess } from '../../utils/response.js';
import { UnauthorizedError } from '../../errors/index.js';
import {
  listTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  assignTask,
  toggleComplete,
} from './tasks.service.js';

export const listTasksHandler = asyncHandler(
  async (req, res) => {
    const tasks = await listTasks(req.params.roomId, req.query);
    sendSuccess(res, tasks);
  }
);

export const getTaskHandler = asyncHandler(
  async (req, res) => {
    const task = await getTask(req.params.roomId, req.params.taskId);
    sendSuccess(res, task);
  }
);

export const createTaskHandler = asyncHandler(
  async (req, res) => {
    if (!req.user) {
      throw new UnauthorizedError();
    }

    const task = await createTask(req.params.roomId, req.user.userId, req.body);
    sendSuccess(res, task, 201);
  }
);

export const updateTaskHandler = asyncHandler(
  async (req, res) => {
    const task = await updateTask(req.params.roomId, req.params.taskId, req.body);
    sendSuccess(res, task);
  }
);

export const deleteTaskHandler = asyncHandler(
  async (req, res) => {
    const result = await deleteTask(req.params.roomId, req.params.taskId);
    sendSuccess(res, result);
  }
);

export const assignTaskHandler = asyncHandler(
  async (req, res) => {
    const task = await assignTask(
      req.params.roomId,
      req.params.taskId,
      req.body.assignedTo
    );
    sendSuccess(res, task);
  }
);

export const completeTaskHandler = asyncHandler(
  async (req, res) => {
    if (!req.user) {
      throw new UnauthorizedError();
    }

    const task = await toggleComplete(
      req.params.roomId,
      req.params.taskId,
      req.user.userId
    );
    sendSuccess(res, task);
  }
);
