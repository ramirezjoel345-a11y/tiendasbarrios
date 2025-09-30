const { Conversation, Message } = require('../models');

exports.createConversationForStore = async (req, res) => {
  try {
    const { storeId } = req.params;
    const customerUserId = req.user.id; // <- viene del middleware auth

    let conv = await Conversation.findOne({ where: { storeId, customerUserId } });
    if (!conv) {
      conv = await Conversation.create({ storeId, customerUserId, status: 'OPEN' });
    }

    res.json({ ok: true, data: conv });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
};

exports.listConversationsByStore = async (req, res) => {
  try {
    const { storeId } = req.params;
    const where = { storeId };
    if (req.query.customerUserId) where.customerUserId = req.query.customerUserId;

    const conversations = await Conversation.findAll({
      where,
      order: [['updatedAt', 'DESC']],
    });

    res.json({ ok: true, data: conversations });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
};

exports.listMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const msgs = await Message.findAll({
      where: { conversationId },
      order: [['createdAt', 'ASC']],
    });

    res.json({ ok: true, data: msgs });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
};

exports.createMessage = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { senderType, text } = req.body;

    if (!['USER', 'STORE'].includes(senderType)) {
      return res.status(422).json({ ok: false, error: 'senderType debe ser "USER" o "STORE"' });
    }

    const msg = await Message.create({
      conversationId,
      senderType,
      body: text,
      senderUserId: senderType === 'USER' ? req.user.id : null,
    });

    res.status(201).json({ ok: true, data: msg });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
};

exports.markRead = async (req, res) => {
  try {
    const { id } = req.params;
    const [updated] = await Message.update(
      { readAt: new Date() },
      { where: { id } }
    );
    res.json({ ok: true, updated: updated > 0 });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
};
