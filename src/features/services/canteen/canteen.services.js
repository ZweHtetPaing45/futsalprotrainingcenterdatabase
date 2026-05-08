const repo = require('./canteen.repositories');

class CanteenMenu{

    async showMenu(){

        const result = await repo.showMenu();

        return result;

    }

}

module.exports = new CanteenMenu();