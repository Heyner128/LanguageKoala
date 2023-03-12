import * as dotenv from 'dotenv';
import {
  exampleUsers,
  exampleGroups,
  exampleSubscriptions,
} from './Utils/exampleData';
import DataGenerator from './Utils/dataGenerator.util';
import App from './App';

dotenv.config();

// creates mock-up data
DataGenerator.resetDatabase();
DataGenerator.createData(exampleUsers, exampleGroups, exampleSubscriptions);

// starts the app
App.start();
