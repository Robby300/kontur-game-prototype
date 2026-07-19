export const VISUAL_ASSETS = Object.freeze({
  "NRV05-P01": Object.freeze({
    src: "assets/visual-v1/01-opening-silent-reservoir.png",
    alt: "Подземный резервуар: группа и две автономные машины ждут на мостике, Аша и кассета находятся за затвором.",
    loading: "eager",
  }),
  "NRV05-P02": Object.freeze({
    src: "assets/visual-v1/02-route-choice.png",
    alt: "Схема двух возможных маршрутов: тяжёлый KROT у затвора и лёгкая IGLA с тросом; ни один маршрут ещё не выбран.",
    caption: "Схема двух возможных маршрутов; ни один ещё не выбран.",
    loading: "lazy",
  }),
  "NRV05-P03": Object.freeze({
    src: "assets/visual-v1/02-route-choice.png",
    alt: "Схема двух возможных маршрутов: тяжёлый KROT у затвора и лёгкая IGLA с тросом; ни один маршрут ещё не выбран.",
    caption: "Схема двух возможных маршрутов; ни один ещё не выбран.",
    loading: "lazy",
  }),
  "NRV05-P05": Object.freeze({
    src: "assets/visual-v1/03-krot-mid-crisis.png",
    alt: "Разрушенная рама зажала KROT у затвора; Аша стоит на площадке рядом с треснувшей кассетой, IGLA остаётся наверху.",
    loading: "lazy",
    minRevealStep: 4,
  }),
  "NRV05-P14": Object.freeze({
    src: "assets/visual-v1/04-costly-water-epilogue.png",
    alt: "В КОНТУРЕ-7 Аша и IGLA стоят у подключённой треснувшей кассеты; экран показывает оставленный в шахте KROT.",
    loading: "lazy",
  }),
});

export const VISUAL_WIDTH = 1672;
export const VISUAL_HEIGHT = 941;

export function visualModeFromSearch(search) {
  return new URLSearchParams(search).get("visual") === "1";
}

export function visualAssetFor(packetId, revealStep = Number.POSITIVE_INFINITY) {
  const asset = VISUAL_ASSETS[packetId] ?? null;
  if (!asset || revealStep < (asset.minRevealStep ?? 0)) return null;
  return asset;
}
