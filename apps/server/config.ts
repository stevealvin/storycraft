import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

export const CONFIG = {
  port: parseInt(process.env.PORT || '3001', 10),
  dataDir: path.resolve(process.cwd(), '../../data'),
  projectsDir: path.resolve(process.cwd(), '../../data', 'projects'),
};
