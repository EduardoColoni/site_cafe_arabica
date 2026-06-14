import { Sequelize } from 'sequelize';
import * as fs from 'fs';
import * as path from 'path';

const configPath = path.join(process.cwd(), 'src', 'config', 'config.json')
const configJson = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
const dbConfig = configJson['development'];

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: dbConfig.storage,
    logging: false
});

export default sequelize;