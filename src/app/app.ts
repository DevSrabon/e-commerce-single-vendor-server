import cookieParser from "cookie-parser";
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
import { IUserType } from "../utils/types/commonTypes";
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
      max: 200, // limit each IP to 100 requests per windowMs
      message:
        "Too many requests from this IP, please try again after 15 minutes.",
    });
    this.app.use(limiter);

    // // CSRF protection middleware
    // this.app.use(csurf({ cookie: true }));

    // Provide CSRF token to clients
    // this.app.use((req: Request, res: Response, next: NextFunction) => {
    //   if (req.csrfToken) {
    //     const csrfToken = req.csrfToken();
    //     res.cookie("XSRF-TOKEN", csrfToken, { httpOnly: false, secure: false });
    //   }
    //   next();
    // });

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
      const { id, type } = socket.handshake.auth as {
        id: number;
        type: IUserType;
      };
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
      } else if (type === "admin" && id) {
        await this.commonService.updateSocketId({
          id,
          socketId: socket.id,
          type: "admin",
        });
      } else if (type === "anonymous" && id) {
        await this.commonService.updateSocketId({
          id,
          socketId: socket.id,
          type: "anonymous",
        });
      }
    });
  }

  // Init routers
  private initRouters() {
    this.app.get("/", (_req: Request, res: Response) => {
      res.send(`Server is running....🚀`);
    });

    this.app.get("/health-check", (req: Request, res: Response) => {
      console.log(req);
      return res.status(200).json({
        status: 200,
        message: "Hello from health-check path!",
        agent: req.headers["user-agent"],
      });
    });

    // // Expose CSRF token for Postman
    this.app.get("/csrf-token", (_req: Request, res: Response) => {
      res.json({ csrfToken: _req.csrfToken() });
    });

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
