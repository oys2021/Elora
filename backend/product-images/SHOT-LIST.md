# Product photo shot list

Photos for the 30 products in the store. Drop the files into this folder (`backend/product-images/`), then run:

```
npm run images:upload -- --dry-run   # check the filenames match, uploads nothing
npm run images:upload                # upload to Cloudinary and save on each product
```

Run both from the `backend` folder. Re-running is safe: photos are replaced, not duplicated.

## Naming
- Main image: `<filename>` exactly as shown below (the first image is what shows on product cards).
- Extra gallery images: add `-2`, `-3` ... before the extension, for example `body-wave-hd-lace-front-wig-2.jpg`.
- Accepted formats: .jpg, .jpeg, .png, .webp, .avif. Any other file or a wrong name is listed as unmatched by the script.

## Image specs
- **Square, about 1000 x 1000 px** (the product cards crop to a square).
- Plain or softly lit background, sharp focus, and the same lighting across a category so the shop looks consistent.
- Under 2 MB each.
- Images belong to the **product**, not to a colour or length. If you sell several colours, use the main image for the most popular one and show the others as extra images.

## Checklist


### Braiding & Extensions

| # | Product | Save the main photo as | Suggested shots |
|---|---|---|---|
| 1 | Clip-In Human Hair Extensions (7 Piece) | `clip-in-human-hair-extensions-7-piece.jpg` | 1. The pack or bundle, with the label visible<br>2. Close-up of the strands / colour<br>3. A finished style if you have one<br> Colours: Dark Brown, Honey Blonde, Jet Black, Light Brown. |
| 2 | Crochet Faux Locs | `crochet-faux-locs.jpg` | 1. The pack or bundle, with the label visible<br>2. Close-up of the strands / colour<br>3. A finished style if you have one<br> Colours: Auburn, Dark Brown, Jet Black. |
| 3 | Jumbo Braiding Hair | `jumbo-braiding-hair.jpg` | 1. The pack or bundle, with the label visible<br>2. Close-up of the strands / colour<br>3. A finished style if you have one<br> Colours: Dark Brown, Jet Black, Pink, Purple, Red. |
| 4 | Passion Twist Hair | `passion-twist-hair.jpg` | 1. The pack or bundle, with the label visible<br>2. Close-up of the strands / colour<br>3. A finished style if you have one<br> Colours: Burgundy, Chestnut Brown, Jet Black. |
| 5 | Pre-Stretched Braiding Hair | `pre-stretched-braiding-hair.jpg` | 1. The pack or bundle, with the label visible<br>2. Close-up of the strands / colour<br>3. A finished style if you have one<br> Colours: Burgundy, Chestnut Brown, Dark Brown, Jet Black. |
| 6 | Spring Twist Hair | `spring-twist-hair.jpg` | 1. The pack or bundle, with the label visible<br>2. Close-up of the strands / colour<br>3. A finished style if you have one<br> Colours: Dark Brown, Jet Black. |

### Closures & Frontals

| # | Product | Save the main photo as | Suggested shots |
|---|---|---|---|
| 7 | 13x4 Lace Frontal Body Wave | `13x4-lace-frontal-body-wave.jpg` | 1. Piece laid flat, hair side up, showing the lace size<br>2. Close-up of the lace, knots and parting space<br>3. Installed and styled on a head<br> Colours: Natural Black. |
| 8 | 13x6 HD Lace Frontal Straight | `13x6-hd-lace-frontal-straight.jpg` | 1. Piece laid flat, hair side up, showing the lace size<br>2. Close-up of the lace, knots and parting space<br>3. Installed and styled on a head<br> Colours: Natural Black. |
| 9 | 2x6 Deep Part Lace Closure Deep Wave | `2x6-deep-part-lace-closure-deep-wave.jpg` | 1. Piece laid flat, hair side up, showing the lace size<br>2. Close-up of the lace, knots and parting space<br>3. Installed and styled on a head<br> Colours: Natural Black. |
| 10 | 360 Lace Frontal Kinky Straight | `360-lace-frontal-kinky-straight.jpg` | 1. Piece laid flat, hair side up, showing the lace size<br>2. Close-up of the lace, knots and parting space<br>3. Installed and styled on a head<br> Colours: Natural Black. |
| 11 | 4x4 Lace Closure Straight | `4x4-lace-closure-straight.jpg` | 1. Piece laid flat, hair side up, showing the lace size<br>2. Close-up of the lace, knots and parting space<br>3. Installed and styled on a head<br> Colours: Natural Black. |
| 12 | 5x5 HD Lace Closure Body Wave | `5x5-hd-lace-closure-body-wave.jpg` | 1. Piece laid flat, hair side up, showing the lace size<br>2. Close-up of the lace, knots and parting space<br>3. Installed and styled on a head<br> Colours: Natural Black. |

### Human Hair Bundles

| # | Product | Save the main photo as | Suggested shots |
|---|---|---|---|
| 13 | Brazilian Body Wave Bundle | `brazilian-body-wave-bundle.jpg` | 1. Bundle held up or fanned out to show length and texture<br>2. Close-up of the texture<br>3. Wet or stretched to show the pattern<br> Colours: Natural Black. |
| 14 | Brazilian Straight Bundle | `brazilian-straight-bundle.jpg` | 1. Bundle held up or fanned out to show length and texture<br>2. Close-up of the texture<br>3. Wet or stretched to show the pattern<br> Colours: Natural Black. |
| 15 | Kinky Curly Bundle | `kinky-curly-bundle.jpg` | 1. Bundle held up or fanned out to show length and texture<br>2. Close-up of the texture<br>3. Wet or stretched to show the pattern<br> Colours: Natural Black. |
| 16 | Peruvian Deep Wave Bundle | `peruvian-deep-wave-bundle.jpg` | 1. Bundle held up or fanned out to show length and texture<br>2. Close-up of the texture<br>3. Wet or stretched to show the pattern<br> Colours: Natural Black. |
| 17 | Raw Vietnamese Straight Bundle | `raw-vietnamese-straight-bundle.jpg` | 1. Bundle held up or fanned out to show length and texture<br>2. Close-up of the texture<br>3. Wet or stretched to show the pattern<br> Colours: Natural Black. |
| 18 | Water Wave Bundle | `water-wave-bundle.jpg` | 1. Bundle held up or fanned out to show length and texture<br>2. Close-up of the texture<br>3. Wet or stretched to show the pattern<br> Colours: Natural Black. |

### Lace Front Wigs

| # | Product | Save the main photo as | Suggested shots |
|---|---|---|---|
| 19 | Blonde 613 Straight Lace Front Wig | `blonde-613-straight-lace-front-wig.jpg` | 1. Front view on a wig head or model, hairline and full length visible<br>2. Close-up of the lace front and baby hairs<br>3. Back or side view showing length and texture<br>4. Inside of the cap (straps, combs)<br> Colours: Blonde 613, Honey Blonde. |
| 20 | Body Wave HD Lace Front Wig | `body-wave-hd-lace-front-wig.jpg` | 1. Front view on a wig head or model, hairline and full length visible<br>2. Close-up of the lace front and baby hairs<br>3. Back or side view showing length and texture<br>4. Inside of the cap (straps, combs)<br> Colours: Natural Black. |
| 21 | Burgundy Body Wave Lace Front Wig | `burgundy-body-wave-lace-front-wig.jpg` | 1. Front view on a wig head or model, hairline and full length visible<br>2. Close-up of the lace front and baby hairs<br>3. Back or side view showing length and texture<br>4. Inside of the cap (straps, combs)<br> Colours: Burgundy. |
| 22 | Deep Wave Lace Front Wig | `deep-wave-lace-front-wig.jpg` | 1. Front view on a wig head or model, hairline and full length visible<br>2. Close-up of the lace front and baby hairs<br>3. Back or side view showing length and texture<br>4. Inside of the cap (straps, combs)<br> Colours: Natural Black. |
| 23 | Kinky Curly 4C Lace Front Wig | `kinky-curly-4c-lace-front-wig.jpg` | 1. Front view on a wig head or model, hairline and full length visible<br>2. Close-up of the lace front and baby hairs<br>3. Back or side view showing length and texture<br>4. Inside of the cap (straps, combs)<br> Colours: Natural Black. |
| 24 | Straight 13x4 Lace Front Wig | `straight-13x4-lace-front-wig.jpg` | 1. Front view on a wig head or model, hairline and full length visible<br>2. Close-up of the lace front and baby hairs<br>3. Back or side view showing length and texture<br>4. Inside of the cap (straps, combs)<br> Colours: Dark Brown, Natural Black. |

### Wig Care & Accessories

| # | Product | Save the main photo as | Suggested shots |
|---|---|---|---|
| 25 | Adjustable Wig Stand Tripod | `adjustable-wig-stand-tripod.jpg` | 1. The item on its own on a plain background<br>2. The item in use<br>3. Packaging or label |
| 26 | Edge Control Strong Hold 4oz | `edge-control-strong-hold-4oz.jpg` | 1. The item on its own on a plain background<br>2. The item in use<br>3. Packaging or label |
| 27 | Elastic Wig Grip Band | `elastic-wig-grip-band.jpg` | 1. The item on its own on a plain background<br>2. The item in use<br>3. Packaging or label<br> Colours: Grey, Jet Black, Pink. |
| 28 | Moisturising Leave-In Conditioner | `moisturising-leave-in-conditioner.jpg` | 1. The item on its own on a plain background<br>2. The item in use<br>3. Packaging or label |
| 29 | Satin-Lined Sleeping Bonnet | `satin-lined-sleeping-bonnet.jpg` | 1. The item on its own on a plain background<br>2. The item in use<br>3. Packaging or label<br> Colours: Jet Black, Pink, Purple. |
| 30 | Wide-Tooth Detangling Comb | `wide-tooth-detangling-comb.jpg` | 1. The item on its own on a plain background<br>2. The item in use<br>3. Packaging or label |
