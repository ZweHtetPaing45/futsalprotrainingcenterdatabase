const repo = require('./banner.repositories');

class BannerService {
	async getBanners() {
		return repo.getBanners();
	}
}

module.exports = new BannerService();
