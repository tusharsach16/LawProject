import fs from 'fs';
import path from 'path';
import { swaggerSpec } from '../config/swagger';

const outputPath = path.resolve(__dirname, '../../swagger.json');
fs.writeFileSync(outputPath, JSON.stringify(swaggerSpec, null, 2));
console.log('✅ Swagger spec exported to backend/swagger.json');
