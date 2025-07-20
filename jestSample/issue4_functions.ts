/**
 * 気象庁の地震情報JSONデータ型定義
 */
interface JmaQuake {
  ttl: string;
  cod: string;
  [key: string]: any;
}

/**
 * 地震データの型定義
 */
interface EarthquakeData {
  latitude: number;
  longitude: number;
  depth: number;
}

/**
 * 座標文字列をパースして [緯度, 経度, 深さ] のタプルを返します。
 * @param coordString - 気象庁の座標文字列
 * @returns パースされた [緯度, 経度, 深さ] のタプル、またはパース失敗時に null
 * @example
 * // 正常な座標文字列の場合
 * parseCoordinates("+36.1+140.7-30000/"); // [36.1, 140.7, -30000]
 *
 * // 不正な形式の場合
 * parseCoordinates("invalid"); // null
 */
export function parseCoordinates(coordString: string): [number, number, number] | null {
  const match = coordString.match(/([+-]\d{2}\.\d+)([+-]\d{3}\.\d+)(.*)\//);

  if (!match) {
    console.error("Invalid coordinate string format:", coordString);
    return null;
  }

  try {
    const lat = parseFloat(match[1]);
    const lon = parseFloat(match[2]);
    const depth = parseFloat(match[3]);
    return [lat, lon, depth];
  } catch (error) {
    console.error("Failed to parse coordinates:", error);
    return null;
  }
}

/**
 * 気象庁から地震データを取得し、座標データを整形します。
 * @param maxDepth - 最大深度（km）。指定された深度より浅い地震のみを返す
 * @returns 緯度、経度、深さを含むオブジェクトの配列
 * @example
 * // 全ての地震データを取得
 * const allEarthquakes = await getEarthquakeData();
 *
 * // 深度10km以下の浅い地震のみを取得
 * const shallowEarthquakes = await getEarthquakeData(10);
 */
export async function getEarthquakeData(maxDepth?: number): Promise<EarthquakeData[]> {
  const url = 'https://www.jma.go.jp/bosai/quake/data/list.json';

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data: JmaQuake[] = await response.json();

    const quakes = data.filter(quake => quake.ttl === '震源・震度情報');

    const earthquakeData = quakes
      .map(quake => parseCoordinates(quake.cod))
      .filter((coord): coord is [number, number, number] => coord !== null)
      .map(coord => ({
        latitude: coord[0],
        longitude: coord[1],
        depth: -0.001 * coord[2]
      }))
      .filter(quake => maxDepth === undefined || quake.depth <= maxDepth);

    return earthquakeData;
  } catch (error) {
    console.error("Failed to fetch or parse earthquake data:", error);
    return [];
  }
}

/**
 * 地震データの平均深度を計算します。
 * @param earthquakeData - 地震データの配列
 * @returns 平均深度（km）、データが空の場合は0
 * @example
 * // 地震データがある場合
 * const data = [
 *   { latitude: 36.1, longitude: 140.7, depth: 30 },
 *   { latitude: 35.5, longitude: 139.8, depth: 10 }
 * ];
 * getAverageDepth(data); // 20
 *
 * // 空の配列の場合
 * getAverageDepth([]); // 0
 */
export function getAverageDepth(earthquakeData: EarthquakeData[]): number {
  if (earthquakeData.length === 0) {
    return 0;
  }

  const totalDepth = earthquakeData.reduce((sum, quake) => sum + quake.depth, 0);
  return totalDepth / earthquakeData.length;
}
