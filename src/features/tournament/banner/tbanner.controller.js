const service = require('./tbanner.service');

class TournamentBannerController {
	async getTournamentBanners(req, res, next) {
		try {
			const result = await service.getTournamentBanners();

			res.status(200).json({
				status: 'success',
				result
			});
		} catch (error) {
			next(error);
		}
	}
}

module.exports = new TournamentBannerController();