export const createOrderConfirmationEmail = (payload: {
  orderId: string;
  orderDate: string;
  amount: number;
  discountTotal: number;
  grandTotal: number;
  currency: string;
  customer: { name: string; email: string; address: string };
  items: { name: string; amount: number; quantity: number; image?: string }[]; // Include items
}): string => {
  const {
    orderId,
    orderDate,
    amount,
    currency,
    grandTotal,
    discountTotal,
    customer,
    items,
  } = payload;

  // Create product cards HTML
  const productCards = items
    .map(
      (item) => `
      <div style="border: 1px solid #e0e0e0; border-radius: 5px; margin: 10px 0; padding: 10px; display: flex; align-items: center;">
        ${
          item.image
            ? `<img src="${item.image}" alt="${item.name}" style="width: 100px; height: 100px; object-fit: cover; border-radius: 5px; margin-right: 15px;" />`
            : ""
        }
        <div>
          <h3 style="margin: 0;">${item.name}</h3>
          <p style="margin: 5px 0;">Price: ${currency.toUpperCase()} ${item.amount.toFixed(
        2
      )}<br>Quantity: ${item.quantity}</p>
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
          <title>Order Confirmation</title>
          <style>
            body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; color: #333; }
            .container { width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e0e0e0; padding: 20px; }
            .header { text-align: center; padding: 10px; background-color: #0077cc; color: #ffffff; }
            .header h1 { margin: 0; font-size: 24px; }
            .content { padding: 20px; }
            .content h2 { color: #333; font-size: 20px; margin: 0 0 10px; }
            .content p { font-size: 16px; line-height: 1.6; }
            .order-details { margin: 20px 0; }
            .order-details table { width: 100%; border-collapse: collapse; }
            .order-details th, .order-details td { padding: 10px; border: 1px solid #e0e0e0; text-align: left; }
            .order-details th { background-color: #f4f4f4; color: #333; }
            .footer { text-align: center; padding: 20px; font-size: 14px; color: #777; }
            .footer a { color: #0077cc; text-decoration: none; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Order Confirmation</h1>
            </div>
            <div class="content">
              <h2>Hello, ${customer.name}!</h2>
              <p>Thank you for your order! We're excited to let you know that we've received your order and it's being processed.</p>
              <h3>Order Summary</h3>
              <div class="order-details">
                <table>
                  <tr><th>Order ID</th><td>${orderId}</td></tr>
                  <tr><th>Order Date</th><td>${orderDate}</td></tr>
                  <tr><th>Total Amount</th><td>${currency.toUpperCase()} ${amount.toFixed(
    2
  )}</td></tr>
                <tr><th>Discount</th><td>${currency.toUpperCase()} ${discountTotal.toFixed(
    2
  )}</td></tr>
                <tr><th>Grand Total</th><td>${currency.toUpperCase()} ${grandTotal.toFixed(
    2
  )}</td></tr>
                </table>
              </div>
              <h3>Products Ordered</h3>
              <div>
                ${productCards}
              </div>
              <p>If you have any questions about your order, feel free to contact our customer support. We’re here to help!</p>
              <h3>Shipping Details</h3>
              <p><strong>Name:</strong> ${
                customer.name
              }<br><strong>Email:</strong> ${
    customer.email
  }<br><strong>Address:</strong> ${customer.address}</p>
              <p>We’ll notify you once your order is on its way!</p>
            </div>
            <div class="footer">
              <p>If you have any questions, please <a href="mailto:support@example.com">contact us</a>.</p>
              <p>&copy;  ${new Date().getFullYear()} SABA AL WADU. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `;
};

export const createPaymentConfirmationEmail = (payload: {
  paymentDate: string;
  amountPaid: number;
  currency: string;
  customer: { name: string; email: string; address: string };
}): string => {
  const { paymentDate, amountPaid, currency, customer } = payload;

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Payment Confirmation</title>
      <style>
        body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; color: #333; }
        .container { width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e0e0e0; padding: 20px; }
        .header { text-align: center; padding: 10px; background-color: #28a745; color: #ffffff; }
        .header h1 { margin: 0; font-size: 24px; }
        .content { padding: 20px; }
        .content h2 { color: #333; font-size: 20px; margin: 0 0 10px; }
        .content p { font-size: 16px; line-height: 1.6; }
        .payment-details { margin: 20px 0; }
        .payment-details table { width: 100%; border-collapse: collapse; }
        .payment-details th, .payment-details td { padding: 10px; border: 1px solid #e0e0e0; text-align: left; }
        .payment-details th { background-color: #f4f4f4; color: #333; }
        .footer { text-align: center; padding: 20px; font-size: 14px; color: #777; }
        .footer a { color: #28a745; text-decoration: none; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Payment Confirmation</h1>
        </div>
        <div class="content">
          <h2>Hello, ${customer.name}!</h2>
          <p>We’re pleased to confirm that your payment has been successfully received.</p>
          <h3>Payment Details</h3>
          <div class="payment-details">
            <table>
              <tr><th>Payment Date</th><td>${paymentDate}</td></tr>
              <tr><th>Amount Paid</th><td>${currency.toUpperCase()} ${amountPaid.toFixed(
    2
  )}</td></tr>
            </table>
          </div>
          <p>Thank you for your payment! If you have any questions, please feel free to reach out to our support team.</p>
          <h3>Billing Details</h3>
          <p><strong>Name:</strong> ${
            customer.name
          }<br><strong>Email:</strong> ${
    customer.email
  }<br><strong>Address:</strong> ${customer.address}</p>
          <p>We look forward to serving you again!</p>
        </div>
        <div class="footer">
          <p>If you need assistance, please <a href="mailto:support@example.com">contact us</a>.</p>
          <p>&copy; ${new Date().getFullYear()} SABA AL WADU. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};
