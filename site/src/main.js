import 'leaflet/dist/leaflet.css';
import 'leaflet-atlas/css';

import { MapApp } from 'leaflet-atlas';
import { config } from './config.js';
import { initAnalytics } from './analytics.js';

initAnalytics();

const app = new MapApp(config);
