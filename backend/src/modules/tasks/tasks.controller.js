import { asyncHandler } from '../../middlewares/async-handler.js';
import { sendSuccess } from '../../utils/response.js';
import {
  listTasks,
  createTask,
  updateTask,
  deleteTask,
  markDone,
  renewTask,
} from './tasks.service.js';

export const listTasksHandler = asyncHandler(
  async (req, res) => {
    const tasks = await listTasks(req.params.roomId, req.query);
    sendSuccess(res, tasks);
  }
);

export const createTaskHandler = asyncHandler(
  async (req, res) => {
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

export const markDoneHandler = asyncHandler(
  async (req, res) => {
    const task = await markDone(
      req.params.roomId,
      req.params.taskId,
      req.user.userId
    );
    sendSuccess(res, task);
  }
);

export const renewTaskHandler = asyncHandler(
  async (req, res) => {
    const task = await renewTask(req.params.roomId, req.params.taskId, req.body);
    sendSuccess(res, task);
  }
);
