import { randomUUID } from 'node:crypto';

// Adds a "Cosmetics & Skincare" category with lotions, creams and similar products.
//
// Unlike 20260925100000-catalog.js this does NOT touch the rest of the store: it
// only replaces the products in its own category, so it can be re-run safely.
// (Re-running the catalog seeder wipes everything, including this category, so
// run this one again afterwards: `npm run db:seed:all` does both in order.)
//
// Variants only have Length / Density / Colour options, none of which fit
// lotions and creams, so the size is part of each product name ("400ml") and
// each product has a single variant. Only the tinted lip balm has several
// variants, because its shades really are colours.

const CATEGORY = { name: 'Cosmetics & Skincare', code: 'COS' };

const slugify = (text) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const clean = (value, max) => String(value ?? '').replace(/[^a-z0-9]/gi, '').slice(0, max).toUpperCase();

const initials = (name) =>
  name
    .split(/\s+/)
    .map((w) => clean(w, 1))
    .join('')
    .slice(0, 4);

const USAGE =
  'How to use: apply to clean skin and massage in until absorbed. For external use only. Do a small patch test before first use and stop using it if irritation occurs. Store in a cool place away from direct sunlight and keep the lid closed.';

const products = [
  {
    name: 'Shea Butter Body Lotion 400ml',
    intro:
      'A rich, creamy body lotion made with unrefined shea butter to leave dry skin soft, smooth and lightly glowing for hours after you apply it.',
    features:
      'Non-greasy, fast-absorbing and gentle enough for everyday use on the whole body. The light natural scent is easy to wear and does not overpower other fragrances.',
    price: 65, stock: 48, featured: true, bestseller: true,
  },
  {
    name: 'Cocoa Butter Body Lotion 400ml',
    intro:
      'A deeply moisturising lotion with cocoa butter that softens rough patches and keeps skin comfortable through the dry Harmattan months.',
    features:
      'Smooth, silky texture that sinks in without leaving a sticky film. Works well after a bath or shower while the skin is still slightly damp.',
    price: 60, stock: 52, bestseller: true,
  },
  {
    name: 'Vitamin E Nourishing Body Lotion 500ml',
    intro:
      'A lightweight daily body lotion enriched with vitamin E to help keep skin soft, supple and well moisturised from morning to night.',
    features:
      'Large 500ml pump-style bottle for the whole family, with a fresh, clean scent and a quick-drying finish.',
    price: 75, stock: 40, featured: true,
  },
  {
    name: 'Whipped Shea Body Butter 250g',
    intro:
      'A fluffy whipped body butter made with shea and mango butter for intense moisture on very dry skin, elbows, knees and heels.',
    features:
      'The whipped texture spreads easily and melts on contact with the skin. A little goes a long way, and it also works as a rich overnight treatment.',
    price: 90, stock: 30, bestseller: true,
  },
  {
    name: 'Hydrating Face Cream with Hyaluronic Acid 50ml',
    intro:
      'A light daily face cream with hyaluronic acid that gives lasting moisture and leaves skin feeling plump, soft and fresh.',
    features:
      'Suitable for normal, dry and combination skin. It sits well under makeup and does not leave a greasy shine.',
    price: 120, stock: 25, featured: true,
  },
  {
    name: 'Brightening Vitamin C Face Cream 50ml',
    intro:
      'A face cream with vitamin C that helps skin look brighter and more even, and keeps it comfortably moisturised through the day.',
    features:
      'Light, non-sticky texture that absorbs quickly. Use daily in the morning or evening, and follow with sunscreen when using it during the day.',
    price: 140, stock: 22,
  },
  {
    name: 'Night Repair Face Cream with Niacinamide 50ml',
    intro:
      'A comforting night cream with niacinamide that works while you sleep to help skin look smoother, more even and refreshed by morning.',
    features:
      'Rich yet non-greasy, and suitable for normal to dry skin. Apply a thin layer after cleansing and toning as the last step of your evening routine.',
    price: 130, stock: 24,
  },
  {
    name: 'Oil-Free Gel Face Cream 50ml',
    intro:
      'A cooling, water-based gel cream that hydrates without heaviness, made for oily and combination skin that still needs moisture.',
    features:
      'Absorbs in seconds with a matte, fresh finish that sits well under makeup and does not clog the look of pores.',
    price: 95, stock: 30,
  },
  {
    name: 'Rose Water Hydrating Toner 200ml',
    intro:
      'A gentle, alcohol-free toner with rose water that refreshes skin after cleansing and leaves it soft, calm and ready for moisturiser.',
    features:
      'Light, mist-like texture with a delicate natural rose scent. Suitable for all skin types, and lovely chilled in warm weather.',
    price: 55, stock: 45, bestseller: true,
    usage:
      'How to use: after cleansing, apply to a cotton pad and sweep over the face and neck, or pat in with clean hands. Follow with your moisturiser. Avoid the eyes. Do a small patch test before first use and stop using it if irritation occurs.',
  },
  {
    name: 'Green Tea Balancing Toner 200ml',
    intro:
      'A soothing alcohol-free toner with green tea extract that helps balance and refresh combination and oily skin after cleansing.',
    features:
      'Leaves skin feeling clean and comfortable, without tightness or a sticky film, and preps the skin so creams and serums absorb better.',
    price: 70, stock: 38,
    usage:
      'How to use: after cleansing, apply to a cotton pad and sweep over the face and neck morning and evening. Follow with your moisturiser. Avoid the eyes. Do a small patch test before first use and stop using it if irritation occurs.',
  },
  {
    name: 'Ceramide Barrier Moisturiser 50ml',
    intro:
      'A nourishing daily moisturiser with ceramides that helps support the skin barrier and keep moisture in, for skin that feels soft and comfortable all day.',
    features:
      'Fragrance-light and suitable for dry and sensitive-feeling skin. Use morning and evening after toner.',
    price: 115, stock: 27, featured: true,
  },
  {
    name: 'Aloe & Cucumber Light Gel Moisturiser 100ml',
    intro:
      'A fresh, lightweight gel moisturiser with aloe vera and cucumber that hydrates and cools skin, ideal for hot weather and everyday use.',
    features:
      'Generous 100ml size with a quick-absorbing, non-sticky finish. Works on the face and can also be used to soothe skin after sun.',
    price: 50, stock: 50, bestseller: true,
  },
  {
    name: 'Intensive Hand Cream 75ml',
    intro:
      'A rich, fast-absorbing hand cream that soothes dry, rough hands and helps protect them from constant washing and sanitising.',
    features:
      'Compact tube that fits in a handbag or desk drawer. Non-greasy, so you can get back to typing or holding your phone straight away.',
    price: 40, stock: 60,
  },
  {
    name: 'Repairing Foot Cream 100ml',
    intro:
      'A thick, softening foot cream that helps smooth rough heels and dry patches, and keeps feet comfortable in sandals and closed shoes alike.',
    features:
      'Enriched with shea butter and glycerin. Apply at night and pull on cotton socks for the best results.',
    price: 45, stock: 35,
  },
  {
    name: 'Broad Spectrum Sunscreen SPF 50 100ml',
    intro:
      'A lightweight, broad spectrum SPF 50 sunscreen for face and body that helps protect skin from UVA and UVB rays without a white cast.',
    features:
      'Water-resistant, quick-absorbing and suitable for everyday wear. Reapply every two hours when outdoors and after swimming or sweating.',
    price: 110, stock: 28, featured: true, bestseller: true,
  },
  {
    name: 'Tinted Lip Balm',
    intro:
      'A moisturising lip balm with a sheer wash of colour, for soft, healthy-looking lips with a natural tint.',
    features:
      'Smooth, comfortable formula that feels light and does not feel sticky. Comes in three shades. Reapply as often as you like through the day.',
    price: 30, stock: 45,
    colors: ['Pink', 'Red', 'Purple'],
  },
];

export default {
  async up(queryInterface) {
    const now = new Date();

    await queryInterface.sequelize.transaction(async (transaction) => {
      const [existing] = await queryInterface.sequelize.query(
        'SELECT id FROM categories WHERE slug = :slug',
        { replacements: { slug: slugify(CATEGORY.name) }, transaction }
      );

      let categoryId;
      if (existing.length) {
        // Re-run: clear only this category's products (and what hangs off them).
        categoryId = existing[0].id;
        const productIds = `(SELECT id FROM products WHERE "categoryId" = :categoryId)`;
        for (const [table, column] of [
          ['comments', 'productId'],
          ['reviews', 'productId'],
          ['favorites', 'productId'],
        ]) {
          await queryInterface.sequelize.query(
            `DELETE FROM ${table} WHERE "${column}" IN ${productIds}`,
            { replacements: { categoryId }, transaction }
          );
        }
        // Fails (and rolls back) if a variant has already been ordered.
        await queryInterface.sequelize.query(
          `DELETE FROM product_variants WHERE "productId" IN ${productIds}`,
          { replacements: { categoryId }, transaction }
        );
        await queryInterface.sequelize.query('DELETE FROM products WHERE "categoryId" = :categoryId', {
          replacements: { categoryId },
          transaction,
        });
      } else {
        categoryId = randomUUID();
        await queryInterface.bulkInsert(
          'categories',
          [{ id: categoryId, name: CATEGORY.name, slug: slugify(CATEGORY.name), imageUrl: null, createdAt: now, updatedAt: now }],
          { transaction }
        );
      }

      const productRows = [];
      const variantRows = [];
      let seq = 0;

      for (const p of products) {
        const productId = randomUUID();
        productRows.push({
          id: productId,
          categoryId,
          name: p.name,
          slug: slugify(p.name),
          description: `${p.intro}\n\n${p.features}\n\n${p.usage ?? USAGE}`,
          basePrice: p.price,
          imageUrls: JSON.stringify([]),
          isActive: true,
          isFeatured: Boolean(p.featured),
          isBestseller: Boolean(p.bestseller),
          syncStatus: 'PENDING',
          createdAt: now,
          updatedAt: now,
        });

        for (const color of p.colors ?? [null]) {
          seq += 1;
          variantRows.push({
            id: randomUUID(),
            productId,
            sku: [CATEGORY.code, initials(p.name), clean(color, 3), String(seq).padStart(3, '0')].filter(Boolean).join('-'),
            lengthOption: null,
            densityOption: null,
            colorOption: color,
            stockQuantity: p.stock,
            price: p.price,
            createdAt: now,
            updatedAt: now,
          });
        }
      }

      await queryInterface.bulkInsert('products', productRows, { transaction });
      await queryInterface.bulkInsert('product_variants', variantRows, { transaction });

      console.log(`Seeded "${CATEGORY.name}": ${productRows.length} products, ${variantRows.length} variants`);
    });
  },

  async down(queryInterface) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      const [rows] = await queryInterface.sequelize.query('SELECT id FROM categories WHERE slug = :slug', {
        replacements: { slug: slugify(CATEGORY.name) },
        transaction,
      });
      if (!rows.length) return;
      const replacements = { categoryId: rows[0].id };
      const productIds = `(SELECT id FROM products WHERE "categoryId" = :categoryId)`;
      for (const table of ['comments', 'reviews', 'favorites', 'product_variants']) {
        await queryInterface.sequelize.query(`DELETE FROM ${table} WHERE "productId" IN ${productIds}`, { replacements, transaction });
      }
      await queryInterface.sequelize.query('DELETE FROM products WHERE "categoryId" = :categoryId', { replacements, transaction });
      await queryInterface.sequelize.query('DELETE FROM categories WHERE id = :categoryId', { replacements, transaction });
    });
  },
};
