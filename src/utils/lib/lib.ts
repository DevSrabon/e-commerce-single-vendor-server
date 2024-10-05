import bcrypt from "bcryptjs";
import { createCanvas } from "canvas";
import JsBarcode from "jsbarcode";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import QRCode from "qrcode";
import config from "../config/config";
import { allStrings, CLIENT_URL } from "../miscellaneous/constants";
import ManageFile from "./manageFile";

class Lib {
  private manageFile: ManageFile;

  constructor() {
    this.manageFile = new ManageFile(); // Instantiate ManageFile within the constructor
  }

  // make hashed password

  public static async hashPass(password: string) {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  }

  /**
   * verify password
   */
  public static async compare(password: string, hashedPassword: string) {
    return await bcrypt.compare(password, hashedPassword);
  }

  // create token
  public static createToken(
    creds: object,
    secret: string,
    maxAge: number | string
  ) {
    return jwt.sign(creds, secret, { expiresIn: maxAge });
  }

  // verify token
  public static verifyToken(token: string, secret: string) {
    try {
      return jwt.verify(token, secret);
    } catch (err) {
      console.log(err);
      return false;
    }
  }

  // generate random Number

  public static otpGenNumber(length: number) {
    const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];
    let otp = "";

    for (let i = 0; i < length; i++) {
      const randomNumber = Math.floor(Math.random() * 10);

      otp += numbers[randomNumber];
    }

    return otp;
  }

  // generate random Number and alphabet
  public static otpGenNumberAndAlphabet(length: number) {
    let otp = "";

    for (let i = 0; i < length; i++) {
      const randomNumber = Math.floor(Math.random() * 10);

      otp += allStrings[randomNumber];
    }

    return otp;
  }

  // send email by nodemailer
  public static async sendEmail(
    email: string,
    emailSub: string,
    emailBody: string
  ) {
    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: config.EMAIL_SEND_EMAIL_ID,
          pass: config.EMAIL_SEND_PASSWORD,
        },
      });

      const info = await transporter.sendMail({
        from: config.EMAIL_SEND_EMAIL_ID,
        to: email,
        subject: emailSub,
        html: emailBody,
      });

      console.log("Message send: %s", info);

      return true;
    } catch (err: any) {
      console.log({ err });
      return false;
    }
  }

  public static stringToSlug(str: string) {
    // Remove any leading or trailing whitespace
    str = str.trim();
    // Convert to lowercase
    str = str.toLowerCase();
    // Replace spaces with dashes
    str = str.replace(/\s+/g, "-");

    // Remove special characters, Bangla script characters included
    str = str.replace(/[^\u0980-\u09FFa-z0-9-]/g, "");

    return str;
  }

  // Generate SKU, QR Code, and Barcode
  public async generateProductAssets(
    productName: string,
    categoryCode: number,
    productId: number
  ) {
    // 1. Generate SKU
    const namePart = productName
      .substring(0, 3)
      .toUpperCase()
      .replace(/-/g, "");
    const categoryPart = categoryCode.toString().substring(0, 3).toUpperCase();
    // const randomPart = uuidv4().substring(0, 4).toUpperCase();
    const sku = `${namePart}-${categoryPart}-${productId}`;

    // 2. Generate QR Code
    const qrCodeFileName = `product_files/qrcode/qrCode-${Date.now()}.png`;
    const qrCodeData = await this.generateQRCode(
      `${CLIENT_URL}/products/${productName}`,
      qrCodeFileName
    );

    // 3. Generate Barcode (CODE128)
    const barcodeFileName = `product_files/barcode/barcode-${Date.now()}.png`;
    const barcodeData = await this.generateBarcode(sku, barcodeFileName);

    // Return SKU, QR Code path, and Barcode path
    return {
      sku,
      qrCodeFilePath: qrCodeData,
      barcodeFilePath: barcodeData,
    };
  }

  // Helper method to generate QR Code and upload to S3
  private async generateQRCode(data: string, filePath: string) {
    try {
      const url = await QRCode.toDataURL(data);
      const base64Data = url.replace(/^data:image\/png;base64,/, "");
      const buffer = Buffer.from(base64Data, "base64");

      // Upload to S3
      await this.manageFile.awsUploadBuffer(buffer, filePath);
      return filePath;
    } catch (err) {
      console.error("QR Code Error", err);
      throw new Error("Failed to generate QR Code");
    }
  }

  // Helper method to generate Barcode and upload to S3
  private async generateBarcode(data: string, filePath: string) {
    try {
      const canvas = createCanvas(400, 100); // Adjust canvas size as needed
      JsBarcode(canvas, data, {
        format: "CODE128",
        lineColor: "#000",
        width: 2,
        height: 100,
        displayValue: true,
      });

      const url = canvas.toDataURL("image/png");
      const base64Data = url.replace(/^data:image\/png;base64,/, "");
      const buffer = Buffer.from(base64Data, "base64");

      // Upload to S3
      await this.manageFile.awsUploadBuffer(buffer, filePath);
      return filePath;
    } catch (err) {
      console.error("Barcode Error", err);
      throw new Error("Failed to generate Barcode");
    }
  }

  // getnerate email otp html
  public static generateHtmlOtpPage(otp: string, otpFor: string) {
    return `<!DOCTYPE html>
  <html>
    <head>
      <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>ME Mart OTP FOR VERIFY</title>
    </head>
    <body
      style="
        font-family: Helvetica, Arial, sans-serif;
        margin: 0px;
        padding: 0px;
        background-color: #ffffff;
      "
    >
      <table
        role="presentation"
        style="
          width: 100%;
          border-collapse: collapse;
          border: 0px;
          border-spacing: 0px;
          font-family: Arial, Helvetica, sans-serif;
          background-color: rgb(239, 239, 239);
        "
      >
        <tbody>
          <tr>
            <td
              align="center"
              style="padding: 1rem 2rem; vertical-align: top; width: 100%"
            >
              <table
                role="presentation"
                style="
                  max-width: 600px;
                  border-collapse: collapse;
                  border: 0px;
                  border-spacing: 0px;
                  text-align: left;
                "
              >
                <tbody>
                  <tr>
                    <td style="padding: 40px 0px 0px">
                      <div style="text-align: left">
                        <div style="padding-bottom: 20px">
                          <img
                            src="https://www.memart.online/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fme_logo.e97cc3f6.webp&w=256&q=75"
                            alt="ME Mart"
                            style="width: 100px"
                          />
                        </div>
                      </div>
                      <div
                        style="
                          padding: 20px;
                          background-color: rgb(255, 255, 255);
                        "
                      >
                        <div style="color: rgb(0, 0, 0); text-align: left">
                          <h1 style="margin: 1rem 0">Verification code</h1>
                          <p style="padding-bottom: 16px">
                            Please use the verification code below to ${otpFor}.
                          </p>
                          <p style="padding-bottom: 16px">
                            <strong style="font-size: 130%">${otp}</strong>
                          </p>
                          <p style="padding-bottom: 16px">
                            Validity for OTP is 3 minutes
                          </p>
                          <p style="padding-bottom: 16px">
                            Thanks,<br />
                            <b
                              >ME Mart</b
                            >
                          </p>
                        </div>
                      </div>
                      <div
                        style="
                          padding-top: 20px;
                          color: rgb(153, 153, 153);
                          text-align: center;
                        "
                      >
                        <a href="https://www.memart.online" style="padding-bottom: 16px; text-decoration: none; font-weight: bold;">www.memart.online<a/>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>
    </body>
  </html>
  `;
  }
}
export default Lib;
