'use strict';
module.exports = {
  async up(q) {
    const [user] = await q.sequelize.query(`SELECT id FROM users LIMIT 1;`, { type: q.sequelize.QueryTypes.SELECT });
    if (!user) return;
    await q.bulkInsert('stores', [{
      id: q.sequelize.literal('gen_random_uuid()'),
      ownerUserId: user.id,
      name: 'Tienda Barrios Centro',
      slug: 'tienda-barrios-centro',
      description: 'Mini market de barrio con servicio a domicilio.',
      photoUrl: null, coverUrl: null, phone: '3001234567', addressLine: 'Calle 10 # 5-20',
      lat: 4.6097, lng: -74.0817, isActive: true, createdAt: new Date(), updatedAt: new Date()
    }]);
  },
  async down(q) { await q.bulkDelete('stores', { slug: 'tienda-barrios-centro' }); }
};
