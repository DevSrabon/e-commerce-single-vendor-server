import { body } from "express-validator";

class ChatValidator {
  public createAnonymousChatValidation() {
    return [
      body("email").isString().isEmail().exists(),
      body("first_name").isString().exists(),
      body("last_name").isString().exists(),
    ];
  }
  public createSendChatMessages() {
    return [
      body("sender_type")
        .isString()
        .isIn(["anonymous", "admin", "customer"])
        .exists(),
      body("message").isString().exists(),
      body("sender_id").isString().exists(),
      body("conversation_id").isString().exists(),
    ];
  }
}
export default ChatValidator;
