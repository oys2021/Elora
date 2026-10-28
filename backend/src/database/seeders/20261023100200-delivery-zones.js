import { randomUUID } from 'node:crypto';

// Starter delivery rate card (locations, first-kg price, duration and mode),
// based on a real courier rate card the admin supplied as a reference. All of
// this is editable afterwards from the admin "Delivery Rates" page — this
// seeder just saves them from entering 20 rows by hand on day one.
const ZONES = [
  { location: 'Accra, Tema', firstKgPrice: 30, deliveryDuration: 'Next Day', deliveryMode: 'DOOR_TO_DOOR' },
  { location: 'Kumasi', firstKgPrice: 45, deliveryDuration: 'Next Day', deliveryMode: 'DOOR_TO_DOOR' },
  { location: 'Takoradi', firstKgPrice: 45, deliveryDuration: 'Next Day', deliveryMode: 'DOOR_TO_DOOR' },
  { location: 'Cape Coast & Kasoa', firstKgPrice: 45, deliveryDuration: 'Next Day', deliveryMode: 'DOOR_TO_DOOR' },
  { location: 'Winneba', firstKgPrice: 45, deliveryDuration: 'Next Day', deliveryMode: 'DOOR_TO_DOOR' },
  { location: 'Koforidua', firstKgPrice: 45, deliveryDuration: 'Next Day', deliveryMode: 'DOOR_TO_DOOR' },
  { location: 'Tarkwa', firstKgPrice: 45, deliveryDuration: 'Next Day', deliveryMode: 'DOOR_TO_DOOR' },
  { location: 'Hohoe & Ho', firstKgPrice: 50, deliveryDuration: '48 Hours', deliveryMode: 'DOOR_TO_DOOR' },
  { location: 'Sunyani', firstKgPrice: 50, deliveryDuration: 'Next Day', deliveryMode: 'DOOR_TO_DOOR' },
  { location: 'Tamale', firstKgPrice: 50, deliveryDuration: '48 Hours', deliveryMode: 'DOOR_TO_DOOR' },
  { location: 'Obuasi', firstKgPrice: 50, deliveryDuration: 'Next Day', deliveryMode: 'DOOR_TO_DOOR' },
  { location: 'Aflao', firstKgPrice: 50, deliveryDuration: '48 Hours', deliveryMode: 'DOOR_TO_DOOR' },
  { location: 'Bolgatanga', firstKgPrice: 50, deliveryDuration: '48 Hours', deliveryMode: 'DOOR_TO_DOOR' },
  { location: 'Wa', firstKgPrice: 50, deliveryDuration: '48 Hours', deliveryMode: 'DOOR_TO_DOOR' },
  { location: 'Ashesi', firstKgPrice: 50, deliveryDuration: 'Thursdays', deliveryMode: 'DOOR_TO_DOOR' },
  { location: 'Bogoso', firstKgPrice: 50, deliveryDuration: 'Next Day', deliveryMode: 'OFFICE_PICKUP' },
  { location: 'Dunkwa-on-Offin', firstKgPrice: 50, deliveryDuration: '48 Hours', deliveryMode: 'OFFICE_PICKUP' },
  { location: 'Konongo', firstKgPrice: 45, deliveryDuration: 'Next Day', deliveryMode: 'OFFICE_PICKUP' },
  { location: 'Mankessim', firstKgPrice: 45, deliveryDuration: 'Next Day', deliveryMode: 'OFFICE_PICKUP' },
  { location: 'Nkawkaw', firstKgPrice: 45, deliveryDuration: 'Next Day', deliveryMode: 'OFFICE_PICKUP' },
];

export default {
  async up(queryInterface) {
    const now = new Date();
    await queryInterface.bulkInsert(
      'delivery_zones',
      ZONES.map((zone, index) => ({
        id: randomUUID(),
        location: zone.location,
        firstKgPrice: zone.firstKgPrice,
        extraKgPrice: 5,
        deliveryDuration: zone.deliveryDuration,
        deliveryMode: zone.deliveryMode,
        sortOrder: index,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      }))
    );
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('delivery_zones', null, {});
  },
};
