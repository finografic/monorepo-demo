import type { ChartMeta } from './types';

export const CHARTS: ChartMeta[] = [
  {
    id: 'wait-times',
    title: 'Service Centre Wait Times',
    description: 'Average customer wait and serve times across QLD transport service centres.',
    tags: ['Bar chart', 'Customer service', 'KPI'],
    source: 'Customer service centre wait times',
    sourceUrl: 'https://www.data.qld.gov.au/dataset/customer-service-centre-wait-times',
  },
  {
    id: 'call-volume',
    title: 'Registration Call Centre — Daily Enquiries',
    description: 'Daily call volume for registration enquiries to TMR, May 2026.',
    tags: ['Area chart', 'Call centre', 'Trend'],
    source: 'Registration call centre enquiries',
    sourceUrl: 'https://www.data.qld.gov.au/dataset/registration-call-centre-enquiries-daily-for-last-month',
  },
  {
    id: 'traffic-heatmap',
    title: 'Traffic Volume — Hour × Day Heatmap',
    description: 'Average daily traffic volumes on state-controlled roads by hour and day of week.',
    tags: ['Heatmap', 'D3', 'Traffic patterns'],
    source: 'Queensland traffic data averaged by hour of day',
    sourceUrl:
      'https://www.data.qld.gov.au/dataset/queensland-traffic-data-averaged-by-hour-of-day-and-day-of-week',
  },
  {
    id: 'translink-performance',
    title: 'Translink Monthly Performance',
    description: 'Customer satisfaction scores and complaint volumes for public transport, Jan–Dec 2025.',
    tags: ['Line chart', 'Translink', 'Satisfaction'],
    source: 'Translink monthly performance data',
    sourceUrl: 'https://www.data.qld.gov.au/dataset/translink-monthly-performance-data',
  },
  {
    id: 'traffic-census',
    title: 'Traffic Census — Road Network',
    description:
      'Annual average daily traffic (AADT) for top 10 state-declared roads, with heavy vehicle share.',
    tags: ['Bar chart', 'Road network', 'Census'],
    source: 'Traffic census for the Queensland state-declared road network',
    sourceUrl:
      'https://www.data.qld.gov.au/dataset/traffic-census-for-the-queensland-state-declared-road-network',
  },
  {
    id: 'live-catalogue',
    title: 'Live: QLD Open Data Catalogue',
    description:
      'Live query to the Queensland Open Data CKAN API — latest TMR datasets, resource counts, and freshness.',
    tags: ['Live API', 'CKAN', 'TMR datasets'],
    source: 'Queensland Open Data Portal — CKAN Action API',
    sourceUrl: 'https://www.data.qld.gov.au/api/3/action/package_search',
  },
];
