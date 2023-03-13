import GroupsRouter from './Routes/groups.route';
import UsersRouter from './Routes/users.route';

function start() {
  GroupsRouter.init();
  UsersRouter.init();
  console.log('app started');
}

export default { start };
