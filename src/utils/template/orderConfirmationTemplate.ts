import config from "../config/config";
import { ROOT_FOLDER } from "../miscellaneous/constants";
import { IOrderStatus } from "../types/commonTypes";

export const createPaymentConfirmationEmail = (payload: IOrderStatus) => {
  const {
    orderId,
    orderDate,
    status,
    deliveryDate,
    amount,
    currency,
    grandTotal,
    discountTotal,
    customer,
    items,
  } = payload;
  // Create product cards HTML
  const productCards = items
    ?.map(
      (item) => `
      <div style="border: 1px solid #e0e0e0; border-radius: 5px; margin: 10px 0; padding: 10px; display: flex; align-items: center;">
        ${
          item.image
            ? `<img src="${config.AWS_S3_BASE_URL}${ROOT_FOLDER}/${item.image}" alt="${item.name}" style="width: 100px; height: 100px; object-fit: cover; border-radius: 5px; margin-right: 15px;" />`
            : ""
        }
        <div>
          <h3 style="margin: 0;">${item.fabric_name_en}</h3>
          <p style="margin: 5px 0;">Price: ${currency.toUpperCase()} ${item.amount.toFixed(
        2
      )}</p>
            <strong>Fabric:</strong> ${item.fabric || "N/A"}<br>
            <strong>Size:</strong> ${item.size || "N/A"} <br>
            <strong>Color:</strong> ${item.color || "N/A"}
      <br>

      <p>Quantity: ${item.quantity}</p>
        </div>
      </div>
    `
    )
    .join("");

  return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Order Status Update</title>
        </head>
        <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; color: #333;">
          <div style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e0e0e0; padding: 20px;">
            <!-- Header -->
            <div style="text-align: center; padding: 10px; background-color: #0077cc; color: #ffffff;">
              <h1 style="margin: 0; font-size: 24px;">Order Status Update</h1>
            </div>

            <!-- Content -->
            <div style="padding: 20px;">
              <h2 style="color: #333; font-size: 20px; margin: 0 0 10px;">Hello, ${
                customer.name
              }!</h2>
              <p style="font-size: 16px; line-height: 1.6; margin: 10px 0;">
               We’re pleased to confirm that your payment has been successfully received for Order <strong>#${orderId}</strong>.
              </p>
              ${
                deliveryDate
                  ? `<p style="font-size: 16px; line-height: 1.6; margin: 10px 0;">
                      Estimated Delivery Date: <strong>${deliveryDate}</strong>
                    </p>`
                  : ""
              }
              <h3 style="color: #333; margin: 20px 0 10px;">Order Details</h3>
              <div style="margin: 20px 0;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr><th style="padding: 10px; border: 1px solid #e0e0e0; background-color: #f4f4f4; color: #333;">Order ID</th><td style="padding: 10px; border: 1px solid #e0e0e0;">${orderId}</td></tr>
                  <tr><th style="padding: 10px; border: 1px solid #e0e0e0; background-color: #f4f4f4; color: #333;">Order Date</th><td style="padding: 10px; border: 1px solid #e0e0e0;">${orderDate}</td></tr>
                  <tr><th style="padding: 10px; border: 1px solid #e0e0e0; background-color: #f4f4f4; color: #333;">Total Amount</th><td style="padding: 10px; border: 1px solid #e0e0e0;">${currency.toUpperCase()} ${amount.toFixed(
    2
  )}</td></tr>
                  <tr><th style="padding: 10px; border: 1px solid #e0e0e0; background-color: #f4f4f4; color: #333;">Discount</th><td style="padding: 10px; border: 1px solid #e0e0e0;">${currency.toUpperCase()} ${discountTotal.toFixed(
    2
  )}</td></tr>
                  <tr><th style="padding: 10px; border: 1px solid #e0e0e0; background-color: #f4f4f4; color: #333;">Grand Total</th><td style="padding: 10px; border: 1px solid #e0e0e0;">${currency.toUpperCase()} ${grandTotal.toFixed(
    2
  )}</td></tr>
                </table>
              </div>
              <h3 style="color: #333; margin: 20px 0 10px;">Products in Your Order</h3>
              <div>
                ${productCards}
              </div>
              <div>
                <h3 style="color: #333; margin: 20px 0 10px;">Shipping Details</h3>
                <p style="border: 1px solid #e0e0e0; border-radius: 5px; margin: 10px 0; padding: 10px; font:16px;line-height:1.5">
                  <strong>Name:</strong> ${customer.name}<br>
                  <strong>Email:</strong> ${customer.email}<br>
                  <strong>Phone:</strong> ${customer.phone}<br>
                  <strong>Address:</strong> ${customer.address}
                </p>
              </div>
              <p style="font-size: 16px; line-height: 1.6; margin: 20px 0;">
                If you have any questions about your order or its status, feel free to reach out to our support team. We're here to assist you!
              </p>

            </div>

            <!-- Footer -->
            <div style="text-align: center; padding: 20px; font-size: 14px; color: #777; background-color: #f4f4f4;">
              <p style="margin: 5px 0;">
                If you need assistance, please <a href="mailto:support@example.com" style="color: #0077cc; text-decoration: none;">contact us</a>.
              </p>
              <p style="margin: 5px 0;">
                &copy; ${new Date().getFullYear()} SABA AL WADU. All rights reserved.
              </p>
            </div>
          </div>
        </body>
        </html>
      `;
};

export const createOrderStatusEmail = (payload: IOrderStatus): string => {
  const {
    orderId,
    orderDate,
    status,
    deliveryDate,
    amount,
    currency,
    grandTotal,
    discountTotal,
    customer,
    items,
  } = payload;
  // Create product cards HTML
  const productCards = items
    ?.map(
      (item) => `
      <div style="border: 1px solid #e0e0e0; border-radius: 5px; margin: 10px 0; padding: 10px; display: flex; align-items: center;">
        ${
          item.image
            ? `<img src="${config.AWS_S3_BASE_URL}${ROOT_FOLDER}/${item.image}" alt="${item.name}" style="width: 100px; height: 100px; object-fit: cover; border-radius: 5px; margin-right: 15px;" />`
            : ""
        }
        <div>
          <h3 style="margin: 0;">${item.name}</h3>
          <p style="margin: 5px 0;">Price: ${currency.toUpperCase()} ${item.amount.toFixed(
        2
      )}</p>
            <strong>Fabric:</strong> ${item.fabric || "N/A"}<br>
            <strong>Size:</strong> ${item.size || "N/A"} <br>
            <strong>Color:</strong> ${item.color || "N/A"}
      <br>
      <p>Quantity: ${item.quantity}</p>

        </div>
      </div>
    `
    )
    .join("");

  return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Order Status Update</title>
        </head>
        <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; color: #333;">
          <div style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e0e0e0; padding: 20px;">
            <!-- Header -->
            <div style="text-align: center; padding: 10px; background-color: #0077cc; color: #ffffff;">
              <h1 style="margin: 0; font-size: 24px;">Order Status Update</h1>
            </div>

            <!-- Content -->
            <div style="padding: 20px;">
              <h2 style="color: #333; font-size: 20px; margin: 0 0 10px;">Hello, ${
                customer.name
              }!</h2>
              <p style="font-size: 16px; line-height: 1.6; margin: 10px 0;">
                We’d like to inform you that the status of your order <strong>#${orderId}</strong> has been
                <strong style="color: #0077cc;">${status}</strong>.
              </p>
              ${
                deliveryDate
                  ? `<p style="font-size: 16px; line-height: 1.6; margin: 10px 0;">
                      Estimated Delivery Date: <strong>${deliveryDate}</strong>
                    </p>`
                  : ""
              }
              <h3 style="color: #333; margin: 20px 0 10px;">Order Details</h3>
              <div style="margin: 20px 0;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr><th style="padding: 10px; border: 1px solid #e0e0e0; background-color: #f4f4f4; color: #333;">Order ID</th><td style="padding: 10px; border: 1px solid #e0e0e0;">${orderId}</td></tr>
                  <tr><th style="padding: 10px; border: 1px solid #e0e0e0; background-color: #f4f4f4; color: #333;">Order Date</th><td style="padding: 10px; border: 1px solid #e0e0e0;">${orderDate}</td></tr>
                  <tr><th style="padding: 10px; border: 1px solid #e0e0e0; background-color: #f4f4f4; color: #333;">Total Amount</th><td style="padding: 10px; border: 1px solid #e0e0e0;">${currency.toUpperCase()} ${amount.toFixed(
    2
  )}</td></tr>
                  <tr><th style="padding: 10px; border: 1px solid #e0e0e0; background-color: #f4f4f4; color: #333;">Discount</th><td style="padding: 10px; border: 1px solid #e0e0e0;">${currency.toUpperCase()} ${discountTotal.toFixed(
    2
  )}</td></tr>
                  <tr><th style="padding: 10px; border: 1px solid #e0e0e0; background-color: #f4f4f4; color: #333;">Grand Total</th><td style="padding: 10px; border: 1px solid #e0e0e0;">${currency.toUpperCase()} ${grandTotal.toFixed(
    2
  )}</td></tr>
                </table>
              </div>
              <h3 style="color: #333; margin: 20px 0 10px;">Products in Your Order</h3>
              <div>
                ${productCards}
              </div>
              <div>
                <h3 style="color: #333; margin: 20px 0 10px;">Shipping Details</h3>
                <p style="border: 1px solid #e0e0e0; border-radius: 5px; margin: 10px 0; padding: 10px; font:16px;line-height:1.5">
                  <strong>Name:</strong> ${customer.name}<br>
                  <strong>Email:</strong> ${customer.email}<br>
                  <strong>Phone:</strong> ${customer.phone}<br>
                  <strong>Address:</strong> ${customer.address}
                </p>
              </div>
              <p style="font-size: 16px; line-height: 1.6; margin: 20px 0;">
                If you have any questions about your order or its status, feel free to reach out to our support team. We're here to assist you!
              </p>

            </div>

            <!-- Footer -->
            <div style="text-align: center; padding: 20px; font-size: 14px; color: #777; background-color: #f4f4f4;">
              <p style="margin: 5px 0;">
                If you need assistance, please <a href="mailto:support@example.com" style="color: #0077cc; text-decoration: none;">contact us</a>.
              </p>
              <p style="margin: 5px 0;">
                &copy; ${new Date().getFullYear()} SABA AL WADU. All rights reserved.
              </p>
            </div>
          </div>
        </body>
        </html>
      `;
};
