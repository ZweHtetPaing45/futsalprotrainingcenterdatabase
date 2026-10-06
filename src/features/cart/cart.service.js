const AppError = require("../../utils/AppError");
const repo = require("./cart.repositories");

class cartOrderService {
  async order(
    user_id,
    customer_name,
    phone,
    email,
    delivery_address,
    remark,
    payment_method,
    items,
    file,
    idempotencyKey,
  ) {
    if (!user_id) throw new AppError("User Id is required", 400);
    if (!customer_name) throw new AppError("Customer Name is required", 400);
    if (!phone) throw new AppError("Phone is required", 400);
    if (!email) throw new AppError("Email is required", 400);
    if (!delivery_address)
      throw new AppError("Delivery Address is required", 400);
    if (!remark) throw new AppError("Remark is required", 400);
    if (!payment_method) throw new AppError("Payment Method is required", 400);
    if (!items) throw new AppError("Items is required", 400);
    if (!file) throw new AppError("File is required", 400);

    const result = await repo.order(
      user_id,
      customer_name,
      phone,
      email,
      delivery_address,
      remark,
      payment_method,
      items,
      file,
      idempotencyKey,
    );

    return result;
  }

  async orderList(userId) {
    const result = await repo.orderList(userId);

    return result;
  }

  async showPayment() {
    const result = await repo.showPayment();

    return result;
  }

  async showTax() {
    const result = await repo.showTax();

    return result;
  }
}

module.exports = new cartOrderService();
