import { SharedItem, SharedItemHistory, RoomMember } from '../../db/index.js';
import { NotFoundError } from '../../errors/index.js';
import { getRoomMember } from '../../utils/permissions.js';

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

async function getItem(roomId, itemId) {
  const item = await SharedItem.findOne({
    where: { id: itemId, roomId },
  });

  if (!item) {
    throw new NotFoundError('Item');
  }

  return item.get({ plain: true });
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

async function recordPurchase(roomId, itemId, purchaserUserId, input) {
  const purchaserMember = await getRoomMember(purchaserUserId, roomId);

  const item = await SharedItem.findOne({
    where: { id: itemId, roomId },
  });
  if (!item) {
    throw new NotFoundError('Item');
  }

  const history = await SharedItemHistory.create({
    itemId,
    purchasedBy: purchaserMember.id,
    quantity: input.quantity || 1,
    price: input.price?.toString(),
    currency: input.currency || 'EUR',
    notes: input.notes,
  });

  await SharedItem.update(
    {
      lastPurchasedBy: purchaserMember.id,
      lastPurchasedAt: new Date(),
      status: 'available',
      updatedAt: new Date(),
    },
    { where: { id: itemId } }
  );

  return history.get({ plain: true });
}

async function getItemHistory(roomId, itemId, limit = 10) {
  const item = await SharedItem.findOne({
    where: { id: itemId, roomId },
  });
  if (!item) {
    throw new NotFoundError('Item');
  }

  const history = await SharedItemHistory.findAll({
    where: { itemId },
    attributes: [
      'id', 'itemId', ['purchased_by', 'purchasedById'],
      'quantity', 'price', 'currency', 'notes', 'purchasedAt',
    ],
    order: [['purchasedAt', 'DESC']],
    limit,
  });

  return history.map((h) => h.get({ plain: true }));
}

export {
  listItems,
  getItem,
  createItem,
  updateItem,
  deleteItem,
  updateItemStatus,
  recordPurchase,
  getItemHistory,
};
