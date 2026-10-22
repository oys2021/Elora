import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import cloudinary from '../src/config/cloudinary.js';
import { Product } from '../src/models/index.js';
import { sequelize } from '../src/config/database.js';

// Bulk-uploads product photos to Cloudinary and saves the URLs on each product.
//
//   npm run images:upload             upload everything in backend/product-images
//   npm run images:upload -- --dry-run   show what would happen, upload nothing
//
// File naming: <product-slug>.jpg is the main image; <product-slug>-2.jpg,
// <product-slug>-3.jpg ... are extra gallery images, in that order. See
// product-images/SHOT-LIST.md for the exact filename of every product.
//
// Re-running is safe: images use a fixed Cloudinary public id, so they are
// replaced rather than duplicated. Products with no files are left untouched.

const IMAGE_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../product-images');
const CLOUDINARY_FOLDER = 'elora/products';
const EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif']);
const dryRun = process.argv.includes('--dry-run');

if (!dryRun && (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET)) {
  console.error('Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET in .env.');
  process.exit(1);
}

const products = await Product.findAll({ attributes: ['id', 'name', 'slug', 'imageUrls'] });
const bySlug = new Map(products.map((p) => [p.slug, p]));

const matched = new Map(); 
const unmatched = [];

for (const file of fs.readdirSync(IMAGE_DIR)) {
  const ext = path.extname(file).toLowerCase();
  if (!EXTENSIONS.has(ext)) continue;

  const base = path.basename(file, path.extname(file)).toLowerCase();
  let slug = base;
  let position = 1;
  if (!bySlug.has(slug)) {
    // Not an exact slug, so try "<slug>-<number>" for extra gallery images.
    const m = base.match(/^(.*)-(\d+)$/);
    if (m && bySlug.has(m[1])) {
      slug = m[1];
      position = Number(m[2]);
    } else {
      unmatched.push(file);
      continue;
    }
  }
  if (!matched.has(slug)) matched.set(slug, []);
  matched.get(slug).push({ file, position, base });
}

let uploaded = 0;
let failed = 0;

for (const [slug, files] of matched) {
  const product = bySlug.get(slug);
  files.sort((a, b) => a.position - b.position);
  console.log(`\n${product.name}  (${files.length} image${files.length === 1 ? '' : 's'})`);

  const urls = [];
  for (const { file, base } of files) {
    if (dryRun) {
      console.log(`  would upload ${file}`);
      continue;
    }
    try {
      const result = await cloudinary.uploader.upload(path.join(IMAGE_DIR, file), {
        folder: CLOUDINARY_FOLDER,
        public_id: base,
        overwrite: true,
        resource_type: 'image',
      });
      urls.push(result.secure_url);
      uploaded += 1;
      console.log(`  uploaded ${file}`);
    } catch (err) {
      failed += 1;
      console.error(`  FAILED   ${file}: ${err.message}`);
    }
  }

  // Only save if everything for this product went up, so a partial failure
  // never leaves a product with a half-empty gallery.
  if (!dryRun && urls.length === files.length) {
    await product.update({ imageUrls: urls });
  } else if (!dryRun) {
    console.error(`  Skipped saving ${product.name}: some images failed. Re-run to retry.`);
  }
}

const withoutImages = products.filter((p) => !matched.has(p.slug) && (p.imageUrls ?? []).length === 0);

console.log('\n---');
console.log(dryRun ? 'Dry run: nothing was uploaded or saved.' : `Uploaded ${uploaded} image(s), ${failed} failed.`);
if (unmatched.length) {
  console.log(`\n${unmatched.length} file(s) did not match any product slug (check the spelling against SHOT-LIST.md):`);
  unmatched.forEach((f) => console.log(`  ${f}`));
}
if (withoutImages.length) {
  console.log(`\n${withoutImages.length} product(s) still have no image:`);
  withoutImages.forEach((p) => console.log(`  ${p.slug}`));
}

await sequelize.close();
process.exit(failed ? 1 : 0);
