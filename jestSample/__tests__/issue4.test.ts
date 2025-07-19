import {
  parseCoordinates,
  getEarthquakeData,
  getAverageDepth,
} from "../issue4_functions";

describe("parseCoordinates", () => {
  describe("正常系", () => {
    it("有効な座標文字列を正しくパースする", () => {
      // call
      const result = parseCoordinates("+36.1+140.7-30000/");

      // expect
      expect(result).toEqual([36.1, 140.7, -30000]);
    });
  });

  describe("異常系", () => {
    it("不正な文字列で null を返し、console.error が呼ばれる", () => {
      // mock
      const errorSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => undefined);

      // call
      const result = parseCoordinates("invalid");

      // expect
      expect(result).toBeNull();
      expect(errorSpy).toHaveBeenCalledWith(
        "Invalid coordinate string format:",
        "invalid"
      );

      errorSpy.mockRestore();
    });
  });
});

describe("getEarthquakeData", () => {
  const url = "https://www.jma.go.jp/bosai/quake/data/list.json";

  const sampleResponse = [
    { ttl: "震源・震度情報", cod: "+36.1+140.7-30000/" },
    { ttl: "震源・震度情報", cod: "+35.5+139.8-10000/" },
  ];

  beforeEach(() => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => sampleResponse,
    }) as unknown as typeof fetch;
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("正常系", () => {
    it("全件取得し、座標を整形して返す", async () => {
      // call
      const data = await getEarthquakeData();

      // expect
      expect(global.fetch).toHaveBeenCalledWith(url);
      expect(data).toEqual([
        { latitude: 36.1, longitude: 140.7, depth: 30 },
        { latitude: 35.5, longitude: 139.8, depth: 10 },
      ]);
    });

    it("maxDepth 引数で深度フィルタが働く", async () => {
      // mock

      // call
      const shallow = await getEarthquakeData(15);

      // expect
      expect(shallow).toEqual([
        { latitude: 35.5, longitude: 139.8, depth: 10 },
      ]);
    });
  });

  describe("異常系", () => {
    it("HTTP エラー時に空配列を返し、console.error が呼ばれる", async () => {
      // mock
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
      });
      const errorSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => undefined);

      // call
      const data = await getEarthquakeData();

      // expect
      expect(data).toEqual([]);
      expect(errorSpy).toHaveBeenCalledTimes(1);

      errorSpy.mockRestore();
    });
  });
});

describe("getAverageDepth", () => {
  describe("正常系", () => {
    it("地震データの平均深度を計算する", () => {
      // call
      const avg = getAverageDepth([
        { latitude: 0, longitude: 0, depth: 30 },
        { latitude: 0, longitude: 0, depth: 10 },
      ]);

      // expect
      expect(avg).toBe(20);
    });
  });

  describe("異常系", () => {
    it("空配列なら 0 を返す", () => {
      // call
      const avg = getAverageDepth([]);

      // expect
      expect(avg).toBe(0);
    });
  });
});
