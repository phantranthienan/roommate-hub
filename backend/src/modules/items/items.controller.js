import { asyncHandler } from '../../middlewares/async-handler.js';
import { sendSuccess } from '../../utils/response.js';
import { UnauthorizedError } from '../../errors/index.js';
import {
  listItems,
  getItem,
  createItem,
  updateItem,
  deleteItem,
  updateItemStatus,
  recordPurchase,
  getItemHistory,
} from './items.service.js';

export const listItemsHandler = asyncHandler(
  async (req, res) => {
    const items = await listItems(req.params.roomId, req.query);
    sendSuccess(res, items);
  }
);

export const getItemHandler = asyncHandler(
  async (req, res) => {
    const item = await getItem(req.params.roomId, req.params.itemId);
    sendSuccess(res, item);
  }
);

export const createItemHandler = asyncHandler(
  async (req, res) => {
    const item = await createItem(req.params.roomId, req.body);
    sendSuccess(res, item, 201);
  }
);

export const updateItemHandler = asyncHandler(
  async (req, res) => {
    const item = await updateItem(req.params.roomId, req.params.itemId, req.body);
    sendSuccess(res, item);
  }
);

export const deleteItemHandler = asyncHandler(
  async (req, res) => {
    const result = await deleteItem(req.params.roomId, req.params.itemId);
    sendSuccess(res, result);
  }
);

export const updateStatusHandler = asyncHandler(
  async (req, res) => {
    const item = await updateItemStatus(
      req.params.roomId,
      req.params.itemId,
      req.body.status
    );
    sendSuccess(res, item);
  }
);

export const purchaseHandler = asyncHandler(
  async (req, res) => {
    if (!req.user) {
      throw new UnauthorizedError();
    }

    const history = await recordPurchase(
      req.params.roomId,
      req.params.itemId,
      req.user.userId,
      req.body
    );
    sendSuccess(res, history, 201);
  }
);

export const getHistoryHandler = asyncHandler(
  async (req, res) => {
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const history = await getItemHistory(req.params.roomId, req.params.itemId, limit);
    sendSuccess(res, history);
  }
);
