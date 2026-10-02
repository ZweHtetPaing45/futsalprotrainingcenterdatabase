const AppError = require('../../../utils/AppError');
const com = require('../../../config/com');

exports.getTournamentBanners = async () => {
	try {
		const [rows] = await com.pool.query('SELECT * FROM tournament_banner');
		return rows;
	} catch (error) {
		throw new AppError('Failed to fetch tournament banners', 500);
	}
};