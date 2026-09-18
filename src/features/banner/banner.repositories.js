const AppError = require('../../utils/AppError');
const com = require('../../config/com');

exports.getBanners = async () => {
	try {
		const [rows] = await com.pool.query('SELECT * FROM banner');
		return rows;
	} catch (error) {
		throw new AppError('Failed to fetch banners', 500);
	}
};
