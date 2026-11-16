const pexels = (id: number) => `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&h=650&w=940`;

export const PHOTOS = {
  blazer: pexels(37045049),
  shirt: pexels(8408556),
  trench: pexels(14330778),
  tee: pexels(12389578),
  jeans: pexels(27786098),
  loafers: pexels(38570118),
  sneakers: pexels(30707531),
  slingbacks: pexels(31451000),
  cardigan: pexels(5712104),
  silkTop: pexels(18504977),
  bag: pexels(23223838),
  miniBag: pexels(35237309),
  oldMoney: pexels(28871760),
  parisian: pexels(10815494),
  quietLuxury: pexels(36185756),
  coquette: pexels(19102001),
  streetwear: pexels(39385744),
  casual: pexels(15114415),
  minimal: pexels(9311992),
} as const;
