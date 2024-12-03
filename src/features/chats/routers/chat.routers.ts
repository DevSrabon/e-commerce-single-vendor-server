import CommonAbstractRouter from "../../common/commonAbstract/commmon.abstract.router";
import ChatController from "../controllers/chat.controller";
import ChatValidator from "../utils/validator/chat.validator";
class ChatRouters extends CommonAbstractRouter {
  private controller = new ChatController();
  private validator = new ChatValidator();
  constructor() {
    super();
    this.callRouter();
  }

  private callRouter() {
    this.router
      .route("/anonymous")
      .post(
        this.validator.createAnonymousChatValidation(),
        this.controller.createChatForAnonymousUser
      );
    this.router
      .route("/customer")
      .post(
        this.customerAuthChecker.authChecker,
        this.controller.createChatForCustomer
      );
    this.router
      .route("/customer/:id")
      .post(
        this.adminAuthChecker.authChecker,
        this.controller.createChatForCustomerFromAdmin
      );
    this.router
      .route("/send-message")
      .post(
        this.uploader.storageUploadRaw("chats"),
        this.validator.createSendChatMessages(),
        this.controller.sendChatMessage
      );
    this.router
      .route("/")
      .get(
        this.adminAuthChecker.authChecker,
        this.controller.getMessageForAdminList
      );
    this.router.route("/:id").get(
      // this.customerAuthChecker.authChecker,
      this.controller.getMessages
    );
  }
}

export default ChatRouters;
