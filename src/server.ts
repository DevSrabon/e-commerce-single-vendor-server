import App from "./app/app";
import config from "./utils/config/config";

const app = new App(config.PORT);
app.startServer();
