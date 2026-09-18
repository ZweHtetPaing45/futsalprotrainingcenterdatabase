const service = require('./banner.service');

class BannerController {
	async getBanners(req, res, next) {
		try {
			const result = await service.getBanners();

			res.status(200).json({
				status: 'success',
				result
			});
		} catch (error) {
			next(error);
		}
	}
}

module.exports = new BannerController();
