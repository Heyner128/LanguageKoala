import GroupsRouter from './Routes/groups.route';

function start() {
  GroupsRouter.init();
  console.log('app started');
}

export default { start };
