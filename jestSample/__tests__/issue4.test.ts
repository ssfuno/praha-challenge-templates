import {parseCoordinates, getEarthquakeData, getAverageDepth} from "../issue4_functions";
import type { EarthquakeData } from "../issue4_functions";

describe('parseCoordinates', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('正常系', () => {
    // "+36.1+140.7-30000/"をテスト
    const mockLat = 36.1;
    const mockLon = 140.7;
    const mockDepth = -30000;

    const mockData = [mockLat, mockLon, mockDepth]; 

    const result = parseCoordinates("+36.1+140.7-30000/");
    expect(result).toEqual(mockData);
  });

  describe('異常系', () => {
    let consoleErrorSpy: jest.SpyInstance;

    beforeEach(() => {
      consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    it('coordStringが正規表現にマッチせずnullを返し、console.errorされる', () => {
      const coordString = 'test';

      expect(parseCoordinates(coordString)).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Invalid coordinate string format:', 'test'
      );
    });

    it('parseFloatが例外を投げたらnullを返し、console.errorされる', () => {
      jest.spyOn(global, 'parseFloat').mockImplementation(() => {
        throw new Error('parseFloat failed');
      });
      const result = parseCoordinates('+36.1+140.7-30000/');

      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to parse coordinates:',
        expect.any(Error)
      );
    });
  });
});

describe('getEarthquakeData', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const API_URL = 'https://www.jma.go.jp/bosai/quake/data/list.json';

  it('正常系:ttlが「震源・震度情報」のものだけパースして返す', async () => {
    const mockBody = [
      { ttl: '震源・震度情報', cod: '+34.8+139.3-10000/' },
      { ttl: '震度速報', cod: '+35.0+138.0-5000/' },
    ];

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockBody,
    });

    const result = await getEarthquakeData();
    expect(result).toEqual([
      { latitude: 34.8, longitude: 139.3, depth: 10 },
    ]);
    expect(global.fetch).toHaveBeenCalledWith(API_URL);
  });

  describe('異常系', () => {
    let consoleErrorSpy: jest.SpyInstance;

    beforeEach(() => {
      consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    });
    
    it('エラーが出た場合のcatch処理', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 404,
        data: null,
      });

      const result = await getEarthquakeData();
      expect(result).toEqual([]);

      expect(global.fetch).toHaveBeenCalledWith(API_URL);
      
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to fetch or parse earthquake data:',
        expect.any(Error)
      );
    });
  })
});

describe('getAverageDepth', () => {
  it('地震データがある場合', () => {
    const mockData: EarthquakeData[] = [
      { latitude: 36.1, longitude: 140.7, depth: 30 },
      { latitude: 35.5, longitude: 139.8, depth: 10 }
    ];

    expect(getAverageDepth(mockData)).toBe(20);
  });

  it('空の配列の場合', () => {
    const mockData: EarthquakeData[] = [];

    expect(getAverageDepth(mockData)).toBe(0);
  });
});