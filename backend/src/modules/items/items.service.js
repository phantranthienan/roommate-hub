import { SharedItem } from '../../db/index.js';
import { NotFoundError } from '../../errors/index.js';

async function listItems(roomId, filters = {}) {
  const where = { roomId };
  if (filters.status) where.status = filters.status;
  if (filters.category) where.category = filters.category;

  const items = await SharedItem.findAll({
    where,
    order: [['name', 'ASC']],
  });

  return items.map((i) => i.get({ plain: true }));
}

async function createItem(roomId, input) {
  const item = await SharedItem.create({
    roomId,
    name: input.name,
    category: input.category,
  });

  return item.get({ plain: true });
}

async function updateItem(roomId, itemId, input) {
  const [affectedCount, affectedRows] = await SharedItem.update(
    { ...input, updatedAt: new Date() },
    { where: { id: itemId, roomId }, returning: true }
  );

  if (affectedCount === 0) {
    throw new NotFoundError('Item');
  }

  return affectedRows[0].get({ plain: true });
}

async function deleteItem(roomId, itemId) {
  const item = await SharedItem.findOne({ where: { id: itemId, roomId } });

  if (!item) {
    throw new NotFoundError('Item');
  }

  await item.destroy();
  return { success: true };
}

async function updateItemStatus(roomId, itemId, status) {
  const [affectedCount, affectedRows] = await SharedItem.update(
    { status, updatedAt: new Date() },
    { where: { id: itemId, roomId }, returning: true }
  );

  if (affectedCount === 0) {
    throw new NotFoundError('Item');
  }

  return affectedRows[0].get({ plain: true });
}

export {
  listItems,
  createItem,
  updateItem,
  deleteItem,
  updateItemStatus,
};
