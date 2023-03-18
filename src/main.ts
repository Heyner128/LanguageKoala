import * as dotenv from 'dotenv';
import {
  exampleUsers,
  exampleGroups,
  exampleTokens,
} from './Utils/exampleData';
import DataGenerator from './Utils/dataGenerator.util';
import App from './App';

dotenv.config();

// creates mock-up data
await DataGenerator.resetDatabase();
await DataGenerator.createData(exampleUsers, exampleGroups, exampleTokens);

// starts the app
App.start();
