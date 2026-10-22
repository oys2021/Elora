import { randomUUID } from 'node:crypto';

// Catalogue seed: 5 categories, 30 products, and their variants.
//
// `up` FIRST WIPES the catalogue (categories, products, variants and the
// reviews / comments / favourites attached to them) and then re-inserts it, so
// it can be re-run to reset the store. Users and sessions are never touched.
// Variants that are referenced by an order can't be deleted (order_items has
// ON DELETE RESTRICT), so if real orders exist this seeder fails instead of
// destroying them.
//
// Images are intentionally left empty, upload them from the admin panel.

const lengths = (...n) => n.map((x) => `${x} Inch`);
const densities = (...n) => n.map((x) => `${x}% Density`);

const slugify = (text) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const clean = (value, max) => String(value ?? '').replace(/[^a-z0-9]/gi, '').slice(0, max).toUpperCase();

const roundTo5 = (n) => Math.round(n / 5) * 5;

// Care notes appended to every product description in a category.
const CARE = {
  wigs:
    'Care: detangle gently from the ends upwards, wash with a sulphate-free shampoo, condition the lengths, and air dry on a wig stand. Keep heat tools at or below 180°C and use a heat protectant.',
  bundles:
    'Care: wash with a sulphate-free shampoo and deep condition regularly, detangle from the ends upwards, and wrap or cover the hair at night. With good care, this hair can be worn and restyled for a year or more.',
  closures:
    'Care: handle the lace gently, cut it back carefully when fitting, and wash with a sulphate-free shampoo. Use lace-safe adhesive or a melting band, and remove adhesive properly before washing.',
  braiding:
    'Care: dip the tapered ends in hot water to seal them, moisturise your scalp while the style is in, and take the style down within 6 to 8 weeks to protect your natural hair.',
  accessories: 'Store somewhere cool and dry, and follow the usage directions on the item.',
};

const categories = [
  { key: 'wigs', name: 'Lace Front Wigs', code: 'WIG' },
  { key: 'bundles', name: 'Human Hair Bundles', code: 'BUN' },
  { key: 'closures', name: 'Closures & Frontals', code: 'CLO' },
  { key: 'braiding', name: 'Braiding & Extensions', code: 'BRD' },
  { key: 'accessories', name: 'Wig Care & Accessories', code: 'ACC' },
];

// price of a variant = base + (index of length) * lenStep + (index of density) * denStep
const products = [
  // ---- Lace Front Wigs ----
  {
    cat: 'wigs',
    name: 'Body Wave HD Lace Front Wig',
    intro:
      'A full, bouncy body wave wig made from 100% human hair with a 13x4 HD lace front that melts into the skin for a natural hairline. The waves are soft and defined and hold their shape wash after wash.',
    features:
      'Pre-plucked hairline with baby hairs, bleached knots, and an adjustable cap with combs and straps so it sits securely and comfortably. Can be coloured, curled and restyled.',
    lengths: lengths(18, 22, 26),
    densities: densities(180, 200),
    colors: ['Natural Black'],
    base: 1650, lenStep: 250, denStep: 200,
    featured: true, bestseller: true,
  },
  {
    cat: 'wigs',
    name: 'Straight 13x4 Lace Front Wig',
    intro:
      'A sleek, silky straight wig in 100% human hair with a transparent 13x4 lace front. It has a natural shine, swings freely and looks just like hair growing from the scalp.',
    features:
      'Pre-plucked with baby hairs, tangle-resistant and heat-friendly, so you can flat iron or curl it and it goes back to straight. Glueless-friendly adjustable cap.',
    lengths: lengths(20, 24, 28),
    densities: densities(180, 200),
    colors: ['Natural Black', 'Dark Brown'],
    base: 1750, lenStep: 250, denStep: 200,
    featured: true,
  },
  {
    cat: 'wigs',
    name: 'Deep Wave Lace Front Wig',
    intro:
      'Rich, defined deep wave curls on a 13x4 HD lace front wig. The curls are full and voluminous, with a wet-look finish when scrunched with a little styling cream.',
    features:
      '180% density, pre-plucked hairline, breathable Swiss lace cap and adjustable straps. Curls hold after washing and can be stretched or re-defined.',
    lengths: lengths(18, 22, 26),
    densities: densities(180),
    colors: ['Natural Black'],
    base: 1800, lenStep: 250, denStep: 0,
    bestseller: true,
  },
  {
    cat: 'wigs',
    name: 'Kinky Curly 4C Lace Front Wig',
    intro:
      'A soft, springy kinky curly wig that copies the look of natural 4C texture, with a lace front hairline that blends in naturally with your own edges.',
    features:
      'Lightweight and comfortable for all-day wear, with a glueless cap, combs and adjustable straps. Fluff it out for volume or define the coils with a curl cream.',
    lengths: lengths(14, 18, 22),
    densities: densities(150, 180),
    colors: ['Natural Black'],
    base: 1500, lenStep: 220, denStep: 180,
  },
  {
    cat: 'wigs',
    name: 'Blonde 613 Straight Lace Front Wig',
    intro:
      'A bright, pre-lightened 613 blonde straight wig in 100% human hair, ready to wear or to tone and colour to any shade from icy platinum to warm honey.',
    features:
      'HD lace front, pre-plucked hairline, 180% density and a secure adjustable cap. Because it is already lifted, it takes toner and semi-permanent colour evenly.',
    lengths: lengths(18, 22, 26),
    densities: densities(180),
    colors: ['Blonde 613', 'Honey Blonde'],
    base: 2300, lenStep: 300, denStep: 0,
    featured: true,
  },
  {
    cat: 'wigs',
    name: 'Burgundy Body Wave Lace Front Wig',
    intro:
      'A rich burgundy wine-red wig with soft body waves, made for anyone who wants a bold colour that still looks polished and wearable every day.',
    features:
      'Pre-coloured human hair with a natural-looking lace front, 180% density and an adjustable cap. Use colour-safe shampoo to keep the shade vibrant.',
    lengths: lengths(18, 22),
    densities: densities(180),
    colors: ['Burgundy'],
    base: 1900, lenStep: 250, denStep: 0,
  },

  // ---- Human Hair Bundles (price is per 100g bundle) ----
  {
    cat: 'bundles',
    name: 'Brazilian Body Wave Bundle',
    intro:
      'Soft, defined body waves from a single donor, sold per 100g bundle. The cuticles run in one direction so the hair stays smooth and tangle-free from install to takedown.',
    features:
      'Thick from root to tip, takes colour and bleach well and holds a curl. Best used for sew-ins, quick weaves and custom wigs, and most people need 3 bundles for a full head.',
    lengths: lengths(14, 18, 22, 26),
    densities: [],
    colors: ['Natural Black'],
    base: 420, lenStep: 90, denStep: 0,
  },
  {
    cat: 'bundles',
    name: 'Brazilian Straight Bundle',
    intro:
      'Sleek, silky straight human hair sold per 100g bundle. It has a natural sheen and a smooth, lightweight movement that blends easily with most relaxed and natural textures.',
    features:
      'Minimal shedding, heat-friendly up to 180°C, and it can be dyed, bleached and restyled. A dependable everyday bundle for sew-ins and wigs.',
    lengths: lengths(14, 18, 22, 26),
    densities: [],
    colors: ['Natural Black'],
    base: 400, lenStep: 85, denStep: 0,
    bestseller: true,
  },
  {
    cat: 'bundles',
    name: 'Peruvian Deep Wave Bundle',
    intro:
      'Deep, rounded waves in soft Peruvian human hair, sold per 100g bundle. The pattern is full and bouncy and looks even better when wet or scrunched with a light styling foam.',
    features:
      'Holds its wave pattern after washing, with very little shedding or tangling. A good choice for sew-ins, closures and frontal installs.',
    lengths: lengths(14, 18, 22),
    densities: [],
    colors: ['Natural Black'],
    base: 480, lenStep: 95, denStep: 0,
    featured: true,
  },
  {
    cat: 'bundles',
    name: 'Kinky Curly Bundle',
    intro:
      'Tight, springy kinky curls that blend naturally with 4B and 4C hair, sold per 100g bundle. The texture is soft and it can be stretched, twisted or worn in its natural coil.',
    features:
      'Full at the ends, easy to moisturise and style. Use a water-based leave-in and light oil to keep the curls defined and frizz-free.',
    lengths: lengths(12, 16, 20),
    densities: [],
    colors: ['Natural Black'],
    base: 450, lenStep: 85, denStep: 0,
  },
  {
    cat: 'bundles',
    name: 'Water Wave Bundle',
    intro:
      'Loose, rippled water wave texture sold per 100g bundle, which gives a wet, glossy look even when completely dry.',
    features:
      'Soft and lightweight with a natural shine, and the waves re-form after a wash and a little mousse. Ideal for a full, fluid look in wigs and sew-ins.',
    lengths: lengths(14, 18, 22),
    densities: [],
    colors: ['Natural Black'],
    base: 470, lenStep: 90, denStep: 0,
    bestseller: true,
  },
  {
    cat: 'bundles',
    name: 'Raw Vietnamese Straight Bundle',
    intro:
      'Premium raw Vietnamese human hair, sold per 100g bundle. It is unprocessed, thick and strong with a natural lustre, and it can last several years with proper care.',
    features:
      'Cuticle-aligned and single donor, with a natural colour that lifts cleanly for custom colouring. The best choice for a long-lasting, high-end install.',
    lengths: lengths(16, 20, 24, 28),
    densities: [],
    colors: ['Natural Black'],
    base: 650, lenStep: 120, denStep: 0,
    featured: true,
  },

  // ---- Closures & Frontals ----
  {
    cat: 'closures',
    name: '5x5 HD Lace Closure Body Wave',
    intro:
      'A generous 5x5 HD lace closure in body wave human hair, giving you a wide, natural part and a seamless finish over your install.',
    features:
      'Pre-plucked with bleached knots, free-part styling, and thin, breathable HD lace that blends into most skin tones. Matches body wave bundles.',
    lengths: lengths(12, 14, 16, 18),
    densities: [],
    colors: ['Natural Black'],
    base: 520, lenStep: 60, denStep: 0,
  },
  {
    cat: 'closures',
    name: '4x4 Lace Closure Straight',
    intro:
      'A classic 4x4 lace closure in silky straight human hair, ideal for a neat, natural-looking part in sew-ins and closure wigs.',
    features:
      'Pre-plucked with baby hairs, bleached knots and light Swiss lace that is easy to fit and cut. Pairs perfectly with straight bundles.',
    lengths: lengths(12, 14, 16, 18),
    densities: [],
    colors: ['Natural Black'],
    base: 450, lenStep: 50, denStep: 0,
    bestseller: true,
  },
  {
    cat: 'closures',
    name: '13x4 Lace Frontal Body Wave',
    intro:
      'An ear-to-ear 13x4 lace frontal in body wave human hair, letting you part and style the hairline in any direction, including sleek ponytails and updos.',
    features:
      'Pre-plucked with baby hairs, bleached knots and transparent lace. Sits flat, blends well and can be coloured or customised.',
    lengths: lengths(14, 16, 18, 20),
    densities: [],
    colors: ['Natural Black'],
    base: 780, lenStep: 80, denStep: 0,
    featured: true,
  },
  {
    cat: 'closures',
    name: '13x6 HD Lace Frontal Straight',
    intro:
      'A deep 13x6 HD lace frontal in straight human hair, giving extra parting space and a very natural hairline for wigs and sew-ins.',
    features:
      'Ultra-thin HD lace that disappears on the skin, pre-plucked with baby hairs and bleached knots. Extra depth means more styling options.',
    lengths: lengths(14, 16, 18, 20),
    densities: [],
    colors: ['Natural Black'],
    base: 950, lenStep: 90, denStep: 0,
  },
  {
    cat: 'closures',
    name: '2x6 Deep Part Lace Closure Deep Wave',
    intro:
      'A 2x6 deep-part lace closure in deep wave human hair, which gives a long, natural-looking parting space without the size of a full frontal.',
    features:
      'Pre-plucked hairline, bleached knots and soft lace. A good match for deep wave bundles and quick, neat installs.',
    lengths: lengths(12, 14, 16),
    densities: [],
    colors: ['Natural Black'],
    base: 480, lenStep: 55, denStep: 0,
  },
  {
    cat: 'closures',
    name: '360 Lace Frontal Kinky Straight',
    intro:
      'A 360 lace frontal that goes all the way around the hairline, in kinky straight human hair that looks like relaxed natural hair.',
    features:
      'Lets you style high ponytails and updos without a visible track. Pre-plucked, with bleached knots and elastic band for a secure, comfortable fit.',
    lengths: lengths(14, 16, 18),
    densities: [],
    colors: ['Natural Black'],
    base: 900, lenStep: 85, denStep: 0,
  },

  // ---- Braiding & Extensions ----
  {
    cat: 'braiding',
    name: 'Pre-Stretched Braiding Hair',
    intro:
      'Save hours in the chair with pre-stretched braiding hair. The fibres are already feathered and tapered, so you can start braiding straight away with no separating or stretching.',
    features:
      'Lightweight, itch-free synthetic fibre that seals with hot water. Ideal for box braids, knotless braids and twists, and one pack covers around a third of a head of medium braids.',
    lengths: lengths(26, 32),
    densities: [],
    colors: ['Jet Black', 'Dark Brown', 'Chestnut Brown', 'Burgundy'],
    base: 45, lenStep: 10, denStep: 0,
    featured: true, bestseller: true,
  },
  {
    cat: 'braiding',
    name: 'Passion Twist Hair',
    intro:
      'Soft, wavy passion twist hair that gives a full, bohemian look in a fraction of the usual installation time.',
    features:
      'Lightweight and low-frizz, with a natural-looking curl pattern at the ends. Made to wrap around your own hair for long-lasting twists.',
    lengths: lengths(18, 24),
    densities: [],
    colors: ['Jet Black', 'Chestnut Brown', 'Burgundy'],
    base: 55, lenStep: 10, denStep: 0,
  },
  {
    cat: 'braiding',
    name: 'Spring Twist Hair',
    intro:
      'Bouncy spring twist hair for quick, pre-twisted protective styles that look full and last for weeks.',
    features:
      'Soft, lightweight fibre with springy curls that hold their shape. Simple to install, comfortable on the scalp, and easy to take down.',
    lengths: lengths(16, 24),
    densities: [],
    colors: ['Jet Black', 'Dark Brown'],
    base: 50, lenStep: 10, denStep: 0,
  },
  {
    cat: 'braiding',
    name: 'Jumbo Braiding Hair',
    intro:
      'Classic jumbo braiding hair in a bold range of colours, for box braids, cornrows and twists with plenty of volume.',
    features:
      'Smooth, easy-to-grip fibre that resists tangling and can be sealed at the ends with hot water. Mix shades to create ombre and highlight effects.',
    lengths: lengths(20),
    densities: [],
    colors: ['Jet Black', 'Dark Brown', 'Red', 'Pink', 'Purple'],
    base: 35, lenStep: 0, denStep: 0,
    bestseller: true,
  },
  {
    cat: 'braiding',
    name: 'Crochet Faux Locs',
    intro:
      'Ready-to-install crochet faux locs with a natural, lived-in texture, for a protective style that takes a fraction of the time of traditional locs.',
    features:
      'Lightweight, with soft wrapped strands and loose ends for a realistic look. Install with a crochet needle in a few hours and wear for up to 6 weeks.',
    lengths: lengths(18, 24),
    densities: [],
    colors: ['Jet Black', 'Dark Brown', 'Auburn'],
    base: 65, lenStep: 15, denStep: 0,
  },
  {
    cat: 'braiding',
    name: 'Clip-In Human Hair Extensions (7 Piece)',
    intro:
      'A 7 piece set of clip-in human hair extensions that adds length and volume instantly with no glue, heat or commitment.',
    features:
      'Seamless wefts with secure silicone-lined clips that lie flat and blend into your own hair. Can be heat-styled and coloured, and removed at the end of the day.',
    lengths: lengths(16, 20, 24),
    densities: [],
    colors: ['Jet Black', 'Dark Brown', 'Light Brown', 'Honey Blonde'],
    base: 380, lenStep: 90, denStep: 0,
    featured: true,
  },

  // ---- Wig Care & Accessories (mostly single-variant) ----
  {
    cat: 'accessories',
    name: 'Adjustable Wig Stand Tripod',
    intro:
      'A sturdy tripod wig stand that holds your wig at head height while you style, dry or store it, and folds down for travel.',
    features:
      'Adjustable height with a non-slip head mount and a stable three-leg base. Helps wigs keep their shape between wears.',
    lengths: [], densities: [], colors: [],
    base: 85, lenStep: 0, denStep: 0,
  },
  {
    cat: 'accessories',
    name: 'Elastic Wig Grip Band',
    intro:
      'A soft velvet grip band that keeps your wig secure without glue and helps protect your edges from constant tension.',
    features:
      'Adjustable Velcro fastening and a comfortable velvet lining that grips the hair and stops slipping. Suitable for all-day wear.',
    lengths: [], densities: [],
    colors: ['Jet Black', 'Pink', 'Grey'],
    base: 45, lenStep: 0, denStep: 0,
    bestseller: true,
  },
  {
    cat: 'accessories',
    name: 'Edge Control Strong Hold 4oz',
    intro:
      'A strong-hold edge control that lays baby hairs and edges flat with a smooth, shiny finish that does not flake.',
    features:
      'Non-greasy, water-based formula that lasts through the day and washes out easily. Apply with an edge brush and tie down for a few minutes to set.',
    lengths: [], densities: [], colors: [],
    base: 60, lenStep: 0, denStep: 0,
  },
  {
    cat: 'accessories',
    name: 'Moisturising Leave-In Conditioner',
    intro:
      'A lightweight leave-in conditioner that softens, detangles and adds moisture to natural hair and human hair wigs and bundles.',
    features:
      'Enriched with shea butter and argan oil to reduce frizz and dryness without weighing hair down. Apply to damp hair after washing.',
    lengths: [], densities: [], colors: [],
    base: 75, lenStep: 0, denStep: 0,
    featured: true,
  },
  {
    cat: 'accessories',
    name: 'Satin-Lined Sleeping Bonnet',
    intro:
      'A satin-lined sleeping bonnet that protects your hair and wigs from friction and moisture loss overnight.',
    features:
      'Extra-roomy fit for braids, curls and wigs, with a soft elastic band that stays put without leaving marks. Reduces breakage, frizz and tangling.',
    lengths: [], densities: [],
    colors: ['Jet Black', 'Pink', 'Purple'],
    base: 55, lenStep: 0, denStep: 0,
  },
  {
    cat: 'accessories',
    name: 'Wide-Tooth Detangling Comb',
    intro:
      'A wide-tooth comb that glides through curls, waves and wigs to detangle gently without pulling or breaking hair.',
    features:
      'Smooth, rounded teeth that will not snag, and a comfortable handle. Use on damp hair with conditioner for the best results.',
    lengths: [], densities: [], colors: [],
    base: 25, lenStep: 0, denStep: 0,
  },
];

const initials = (name) =>
  name
    .split(/\s+/)
    .map((w) => clean(w, 1))
    .join('')
    .slice(0, 4);

export default {
  async up(queryInterface) {
    const now = new Date();
    const categoryRows = categories.map((c) => ({
      id: randomUUID(),
      name: c.name,
      slug: slugify(c.name),
      imageUrl: null,
      createdAt: now,
      updatedAt: now,
    }));
    const categoryByKey = Object.fromEntries(categories.map((c, i) => [c.key, { ...c, id: categoryRows[i].id }]));

    const productRows = [];
    const variantRows = [];
    let seq = 0;

    for (const p of products) {
      const category = categoryByKey[p.cat];
      const productId = randomUUID();
      productRows.push({
        id: productId,
        categoryId: category.id,
        name: p.name,
        slug: slugify(p.name),
        description: `${p.intro}\n\n${p.features}\n\n${CARE[p.cat]}`,
        basePrice: p.base,
        imageUrls: JSON.stringify([]),
        isActive: true,
        isFeatured: Boolean(p.featured),
        isBestseller: Boolean(p.bestseller),
        syncStatus: 'PENDING',
        createdAt: now,
        updatedAt: now,
      });

      const lens = p.lengths.length ? p.lengths : [null];
      const dens = p.densities.length ? p.densities : [null];
      const cols = p.colors.length ? p.colors : [null];

      lens.forEach((len, li) => {
        dens.forEach((den, di) => {
          cols.forEach((col) => {
            seq += 1;
            variantRows.push({
              id: randomUUID(),
              productId,
              sku: [
                category.code,
                initials(p.name),
                clean(len, 3),
                clean(den, 3),
                clean(col, 3),
                String(seq).padStart(4, '0'),
              ]
                .filter(Boolean)
                .join('-'),
              lengthOption: len,
              densityOption: den,
              colorOption: col,
              // A few variants are deliberately out of stock so that state is visible.
              stockQuantity: seq % 13 === 0 ? 0 : 4 + ((seq * 7) % 27),
              price: roundTo5(p.base + li * p.lenStep + di * p.denStep),
              createdAt: now,
              updatedAt: now,
            });
          });
        });
      });
    }

    await queryInterface.sequelize.transaction(async (transaction) => {
      // Wipe the catalogue (children first). Fails, and rolls back, if a variant is in an order.
      for (const table of ['comments', 'reviews', 'favorites', 'product_variants', 'products', 'categories']) {
        await queryInterface.bulkDelete(table, null, { transaction });
      }
      await queryInterface.bulkInsert('categories', categoryRows, { transaction });
      await queryInterface.bulkInsert('products', productRows, { transaction });
      await queryInterface.bulkInsert('product_variants', variantRows, { transaction });
    });

    console.log(
      `Seeded ${categoryRows.length} categories, ${productRows.length} products, ${variantRows.length} variants`
    );
  },

  async down(queryInterface) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      for (const table of ['comments', 'reviews', 'favorites', 'product_variants', 'products', 'categories']) {
        await queryInterface.bulkDelete(table, null, { transaction });
      }
    });
  },
};
