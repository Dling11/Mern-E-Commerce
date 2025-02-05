const paypal = require("../../helpers/oldPaypal");  // old
// const paypal = require('@paypal/checkout-server-sdk');
const Order = require("../../models/Order");
const Cart = require("../../models/Cart");
const Product = require("../../models/Product");

// Set up the environment for PayPal (Sandbox or Live)
// const environment = new paypal.core.SandboxEnvironment(
//   process.env.PAYPAL_CLIENT_ID,
//   process.env.PAYPAL_CLIENT_SECRET
// );

// Set up the PayPal client with the environment
// const client = new paypal.core.PayPalHttpClient(environment);

const createOrder = async (req, res) => {
  try {
    const {
      userId,
      cartItems,
      addressInfo,
      orderStatus,
      paymentMethod,
      paymentStatus,
      totalAmount,
      orderDate,
      orderUpdateDate,
      paymentId,
      payerId,
      cartId,
    } = req.body;

    // old paypal method
    const create_payment_json = {
      intent: "sale",
      payer: {
        payment_method: "paypal",
      },
      redirect_urls: {
        return_url: `${process.env.CLIENT_BASE_URL}/shop/paypal-return`,
        cancel_url: `${process.env.CLIENT_BASE_URL}/shop/paypal-cancel`,
      },
      transactions: [
        {
          item_list: {
            items: cartItems.map((item) => ({
              name: item.title,
              sku: item.productId,
              price: item.price.toFixed(2),
              currency: "PHP",
              quantity: item.quantity,
            })),
          },
          amount: {
            currency: "PHP",
            total: totalAmount.toFixed(2),
          },
          description: "description",
        },
      ],
    };
    
    // old paypall method
    paypal.payment.create(create_payment_json, async (error, paymentInfo) => {
      if (error) {
        console.log(error);

        return res.status(500).json({
          success: false,
          message: "Error while creating paypal payment",
        });
      } else {
        const newlyCreatedOrder = new Order({
          userId,
          cartId,
          cartItems,
          addressInfo,
          orderStatus,
          paymentMethod,
          paymentStatus,
          totalAmount,
          orderDate,
          orderUpdateDate,
          paymentId,
          payerId,
        });

        await newlyCreatedOrder.save();

        const approvalURL = paymentInfo.links.find(
          (link) => link.rel === "approval_url"
        ).href;

        res.status(201).json({
          success: true,
          approvalURL,
          orderId: newlyCreatedOrder._id,
        });
      }
    });

    // New paypall method
    // Adjusted request body according to PayPal's Orders API (v2)
    // const create_payment_json = {
    //   intent: "CAPTURE", // Change this to 'CAPTURE' or 'AUTHORIZE'
    //   purchase_units: [{
    //     amount: {
    //       currency_code: "PHP",
    //       value: totalAmount.toFixed(2),
    //     },
    //     item_list: {
    //       items: cartItems.map((item) => ({
    //         name: item.title,
    //         sku: item.productId,
    //         unit_amount: {
    //           currency_code: "PHP",
    //           value: item.price.toFixed(2),
    //         },
    //         quantity: item.quantity,
    //       })),
    //     },
    //   }],
    //   application_context: {
    // return_url: `${process.env.CLIENT_BASE_URL}/shop/paypal-return`,
    // cancel_url: `${process.env.CLIENT_BASE_URL}/shop/paypal-cancel`,
    //   },
    // };

    // // Using the new PayPal SDK to create the order
    // const request = new paypal.orders.OrdersCreateRequest();
    // request.requestBody(create_payment_json);

    // // Execute the request and get the order response
    // const order = await client.execute(request);

    // // Extract the approval URL from the response
    // const approvalURL = order.result.links.find(
    //   (link) => link.rel === "approve"
    // ).href;

    // // Create the order in your database
    // const newlyCreatedOrder = new Order({
    //   userId,
    //   cartId,
    //   cartItems,
    //   addressInfo,
    //   orderStatus,
    //   paymentMethod,
    //   paymentStatus,
    //   totalAmount,
    //   orderDate,
    //   orderUpdateDate,
    //   paymentId,
    //   payerId,
    // });

    // await newlyCreatedOrder.save();

    // // Return the approval URL and the new order ID
    // res.status(201).json({
    //   success: true,
    //   approvalURL,
    //   orderId: newlyCreatedOrder._id,
    // });

  } catch (e) {
    console.error("Error occurred:", e); // Log the error details
    res.status(500).json({
      success: false,
      message: "Some error occurred!",
      error: e.message || e, // Send the error message for debugging
    });
  }
};

const capturePayment = async (req, res) => {
  try {
    const { paymentId, payerId, orderId } = req.body;

    let order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order can not be found",
      });
    }

    // old
    order.paymentStatus = "paid";
    order.orderStatus = "confirmed";
    order.paymentId = paymentId;
    order.payerId = payerId;

    for (let item of order.cartItems) {
      let product = await Product.findById(item.productId);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Not enough stock for this product ${product.title}`,
        });
      }

      product.totalStock -= item.quantity;

      await product.save();
    }

    //  start
    // New PayPal capture flow
    // const request = new paypal.orders.OrdersCaptureRequest(paymentId); // Capture using paymentId
    // const captureResponse = await client.execute(request); // Execute the capture request

    // // Check if capture was successful
    // if (captureResponse.result.status !== "COMPLETED") {
    //   return res.status(500).json({
    //     success: false,
    //     message: "Payment capture failed",
    //   });
    // }

    // // Update the order details with PayPal information
    // order.paymentStatus = "paid";
    // order.orderStatus = "confirmed";
    // order.paymentId = captureResponse.result.id;
    // order.payerId = payerId;

    // // Update product stock levels
    // for (let item of order.cartItems) {
    //   let product = await Product.findById(item.productId);

    //   if (!product) {
    //     return res.status(404).json({
    //       success: false,
    //       message: `Not enough stock for this product ${item.title}`,
    //     });
    //   }

    //   product.totalStock -= item.quantity;

    //   await product.save();
    // }
    // end

    const getCartId = order.cartId;
    await Cart.findByIdAndDelete(getCartId);

    await order.save();

    res.status(200).json({
      success: true,
      message: "Order confirmed",
      data: order,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

const getAllOrdersByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const orders = await Order.find({ userId });

    if (!orders.length) {
      return res.status(404).json({
        success: false,
        message: "No orders found!",
      });
    }

    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

const getOrderDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found!",
      });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

module.exports = {
  createOrder,
  capturePayment,
  getAllOrdersByUser,
  getOrderDetails,
};
