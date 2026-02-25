import { asyncHandler } from '../../middlewares/async-handler.js';
import { sendSuccess } from '../../utils/response.js';
import {
  listItems,
  createItem,
  updateItem,
  deleteItem,
  updateItemStatus,
} from './items.service.js';

export const listItemsHandler = asyncHandler(
  async (req, res) => {
    const items = await listItems(req.params.roomId, req.query);
    sendSuccess(res, items);
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
