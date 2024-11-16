import cookieParser from "cookie-parser"; // Ensure cookie-parser is imported
import cors from "cors";
import express, { Application, NextFunction, Request, Response } from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { Server } from "http";
import morgan from "morgan";
import CommonService from "../features/common/commonService/common.service";
import ErrorHandler from "../features/common/middlewares/errorHandler/errorHandler";
import CustomError from "../utils/lib/customError";
import { origin } from "../utils/miscellaneous/constants";
import Webhooks from "../webhooks/webhook";
import RootRouter from "./router";
import { io, SocketServer } from "./socket";
class App {
  public app: Application;
  private port: number;
  private server: Server;
  private origin: string[] = origin;
  private webhook = new Webhooks();
  private commonService = new CommonService();
  constructor(port: number) {
    this.app = express();
    this.port = port;
    this.server = SocketServer(this.app);
    this.initMiddlewares();
    this.initRouters();
    this.notFoundRouter();
    this.errorHandle();
    this.socket();
  }

  // Start server
  public startServer() {
    this.app.listen(this.port, () => {
      console.log(`Server is started at port: ${this.port} 🚀`);
    });
  }

  // Init middlewares
  private initMiddlewares() {
    // Ensure cookie parser is used before CSRF middleware
    this.app.use(cookieParser());

    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(morgan("dev"));

    // Set security-related HTTP headers with Helmet
    this.app.use(helmet({ xssFilter: true }));

    // Enable CORS for trusted origins
    this.app.use(
      cors({
        origin: this.origin,
        credentials: true,
      })
    );

    // Apply rate limiting to avoid brute-force attacks
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
      message:
        "Too many requests from this IP, please try again after 15 minutes.",
    });
    this.app.use(limiter);

    // // CSRF protection using cookies
    // const csrfProtection = csurf({ cookie: true });
    // // Provide CSRF token to the client as a cookie
    // this.app.use((req: Request, res: Response, next: NextFunction) => {
    //   const csrfToken = req.csrfToken(); // Get CSRF token
    //   res.cookie("XSRF-TOKEN", csrfToken, { httpOnly: true });
    //   next();
    // });
    // this.app.use(csrfProtection);

    // HSTS: Enforce HTTPS, prevent downgrade attacks
    this.app.use(
      helmet.hsts({
        maxAge: 31536000, // One year in seconds
        includeSubDomains: true,
        preload: true,
      })
    );
  }
  // socket connecton
  private socket() {
    io.on("connection", async (socket) => {
      let users: any = {};
      const { id, type } = socket.handshake.auth;
      console.log(`⚡: ${socket.id} user just connected!`);

      socket.on("read_message", async (event) => {
        console.log({ event });
      });

      socket.on("disconnect", async (event) => {
        socket.disconnect();
      });

      if (type === "customer" && id) {
        await this.commonService.updateSocketId({
          id,
          socketId: socket.id,
          type: "customer",
        });
      } else if (type === "admin_user" && id) {
        await this.commonService.updateSocketId({
          id,
          socketId: socket.id,
          type: "admin",
        });
      }
    });
  }

  // Init routers
  private initRouters() {
    this.app.get("/", (_req: Request, res: Response) => {
      res.send(`Server is running....🚀`);
    });

    // // Expose CSRF token for Postman
    // this.app.get("/csrf-token", (_req: Request, res: Response) => {
    //   res.json({ csrfToken: _req.csrfToken() });
    // });

    // Use the API routes
    this.app.use("/api/v1", new RootRouter().v1Router);
    this.app.post("/webhook", this.webhook.stripeWebhook);
  }

  // Handle 404 errors for unknown routes
  private notFoundRouter() {
    this.app.use("*", (_req: Request, _res: Response, next: NextFunction) => {
      next(new CustomError("Cannot find the route", 404, "Invalid route"));
    });
  }

  // Global error handler
  private errorHandle() {
    this.app.use(new ErrorHandler().handleErrors);
  }
}

export default App;
