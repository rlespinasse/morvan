import 'leaflet/dist/leaflet.css';
import 'leaflet-atlas/css';

import { MapApp } from 'leaflet-atlas';
import { config } from './config.js';

const app = new MapApp(config);
