export interface WaitTimeRow {
  centre: string;
  avgWaitMin: number;
  avgServeMin: number;
  dailyCustomers: number;
}

export interface CallVolumeRow {
  date: string;
  enquiries: number;
}

export interface HeatmapCell {
  day: number;
  hour: number;
  volume: number;
}

export interface TranslinkMonthRow {
  month: string;
  satisfactionPct: number;
  complaints: number;
}

export interface TrafficCensusRow {
  road: string;
  location: string;
  aadt: number;
  heavyVehiclePct: number;
}

export interface ChartMeta {
  id: string;
  title: string;
  description: string;
  tags: string[];
  source: string;
  sourceUrl: string;
}
