import { Request, Response } from "express";
import CommonAbstractController from "../../common/commonAbstract/common.abstract.controller";
import ChatService from "../services/chat.services";

class ChatController extends CommonAbstractController {
  private chatService = new ChatService();

  public createChatForAnonymousUser = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const result = await this.chatService.createChatForAnonymousUser(req);
      res.status(200).json(result);
    }
  );
  public createChatForCustomer = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const result = await this.chatService.createChatForCustomer(req);
      res.status(200).json(result);
    }
  );
  public createChatForCustomerFromAdmin = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const result = await this.chatService.createChatForCustomerFromAdmin(req);
      res.status(200).json(result);
    }
  );

  public sendChatMessage = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const result = await this.chatService.sendChatMessage(req);
      res.status(200).json(result);
    }
  );

  public getMessageForAdminList = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const result = await this.chatService.getMessageForAdminList(req);
      res.status(200).json(result);
    }
  );
  public getMessages = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const result = await this.chatService.getChatMessages(req);
      res.status(200).json(result);
    }
  );
}

export default ChatController;
