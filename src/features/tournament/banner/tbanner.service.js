const repo = require('./tbanner.repositories');

class TournamentBannerService {
	async getTournamentBanners() {
		return repo.getTournamentBanners();
	}
}

module.exports = new TournamentBannerService();