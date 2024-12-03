import { Request } from "express";
import { db } from "../../../app/database";
import { io } from "../../../app/socket";
import CustomError from "../../../utils/lib/customError";
import { IUserType } from "../../../utils/types/commonTypes";
import CommonAbstractServices from "../../common/commonAbstract/common.abstract.service";

class ChatService extends CommonAbstractServices {
  // Create a chat session
  public async createChatForAnonymousUser(req: Request) {
    const { email, first_name, last_name } = req.body;

    return await this.db.transaction(async (trx) => {
      const checkAnonymousUser = await trx("anonymous_user")
        .select("*")
        .where({ email })
        .first();
      if (!checkAnonymousUser) {
        const res = await trx("anonymous_user").insert({
          email,
          first_name,
          last_name,
        });
        const con = await trx("conversation").insert({
          participant_id: res[0],
          type: "anonymous",
        });
        return {
          success: true,
          message: "Conversation created successfully",
          data: {
            id: con[0],
          },
        };
      } else {
        const checkConversation = await trx("conversation")
          .select("id")
          .where({ participant_id: checkAnonymousUser.id })
          .andWhere("type", "anonymous")
          .first();
        return {
          success: true,
          message: "Conversation created successfully",
          data: {
            id: checkConversation.id,
          },
        };
      }
    });
  }
  public async createChatForCustomer(req: Request) {
    const { ec_id } = req.customer;
    return await this.db.transaction(async (trx) => {
      const checkConversation = await trx("conversation")
        .select("id")
        .where({ participant_id: ec_id })
        .andWhere("type", "customer")
        .first();
      if (!checkConversation) {
        const res = await trx("conversation").insert({
          participant_id: ec_id,
          type: "customer",
        });
        await trx("e_customer")
          .update({ conversation_id: res[0] })
          .where({ ec_id });

        return {
          success: true,
          message: "Conversation created successfully",
          data: {
            id: res[0],
          },
        };
      }
      return {
        success: true,
        message: "Conversation created successfully",
        data: {
          id: checkConversation.id,
        },
      };
    });
  }
  public async createChatForCustomerFromAdmin(req: Request) {
    const { id } = req.params;
    return await this.db.transaction(async (trx) => {
      const checkCustomer = await trx("e_customer")
        .select("ec_id")
        .where("ec_id", id)
        .first();
      if (!checkCustomer) {
        throw new CustomError("Customer not found!", 404, "Not Found");
      }
      const checkConversation = await trx("conversation")
        .select("id")
        .where({ participant_id: id })
        .andWhere("type", "customer")
        .first();
      if (checkConversation) {
        throw new CustomError(
          "Conversation Already Exists!",
          412,
          "Unprocessable Entity"
        );
      }
      const res = await trx("conversation").insert({
        participant_id: id,
        type: "customer",
      });
      await trx("e_customer")
        .update({ conversation_id: res[0] })
        .where({ ec_id: id });

      return {
        success: true,
        message: "Conversation created successfully",
        data: {
          id: res[0],
        },
      };
    });
  }

  // Save and send a chat message
  public async sendChatMessage(req: Request) {
    return await this.db.transaction(async (trx) => {
      const {
        sender_type,
        message,
        sender_id,
        conversation_id,
      }: {
        sender_type: IUserType;
        sender_id: number;
        message: string;
        conversation_id: number;
      } = req.body;

      const checkConversation = await trx("conversation")
        .select("*")
        .where({ id: conversation_id })
        .first();
      if (!checkConversation) {
        throw new CustomError("Invalid Sender", 412, "Unprocessable Entity");
      }
      const multerFiles = (req.files as Express.Multer.File[]) || [];
      const files = [] as string[];

      // Handle uploaded files
      if (multerFiles.length) {
        multerFiles.forEach((file) => files.push(file.filename));
      }

      // Combine files into payload if applicable
      const messageData = {
        sender_type,
        sender_id,
        message,
        conversation_id,
        files: files.length ? JSON.stringify(files) : null,
      };

      // Save the message in the database
      const [messageId] = await trx("chat_messages").insert(messageData);
      await trx("conversation")
        .update({
          last_message: message ? message.slice(0, 255) : "Attachment",
          last_message_by: sender_type,
        })
        .where({ id: conversation_id });

      // Build the message payload
      const messagePayload = {
        id: messageId,
        sender_type,
        sender_id: sender_id,
        conversation_id,
        message,
        files: files.length ? files : null,
        crated_at: new Date().toISOString(),
      };

      // Send message based on recipient type
      if (sender_type === "admin") {
        if (checkConversation.type === "customer") {
          const checkCustomer = await trx("e_customer")
            .select("id", "socket_id")
            .where("ec_id", checkConversation.participant_id)
            .first();
          if (!checkCustomer) {
            throw new CustomError("No customer found!", 404, "Not Found");
          }
          io.to(checkCustomer.socket_id).emit(
            "customer-chat-messages",
            messagePayload
          );
        }
        if (checkConversation.type === "anonymous") {
          const checkAnonymousUser = await trx("anonymous_user")
            .select("*")
            .where({ id: checkConversation.participant_id })
            .first();
          if (!checkAnonymousUser) {
            throw new CustomError("No Anonymous user found!", 404, "Not Found");
          }
          if (checkAnonymousUser?.socket_id) {
            io.to(checkAnonymousUser.socket_id).emit(
              "anonymous-chat-messages",
              messagePayload
            );
          }
        }
      }

      if (sender_type === "anonymous" || sender_type === "admin") {
        io.emit("admin-chat-messages", messagePayload);
      }

      return {
        success: true,
        message: "Message sent successfully",
        data: {
          messageId,
          message: messagePayload,
        },
      };
    });
  }

  //Get Message list
  public async getMessageForAdminList(req: Request) {
    const { limit = 100, skip = 0 } = req.query;

    const data = await this.db("conversation AS c")
      .select(
        "c.id",
        "c.type",
        "c.participant_id",
        "c.last_message",
        "c.last_message_by",
        this.db.raw(`
        CASE
          WHEN c.type = 'anonymous' THEN CONCAT(anu.first_name, ' ', anu.last_name)
          WHEN c.type = 'customer' THEN ec.ec_name
          ELSE 'Unknown'
        END AS participant_name
      `)
      )
      .leftJoin("anonymous_user AS anu", function () {
        this.on("c.type", "=", db.raw("?", ["anonymous"])).andOn(
          "c.participant_id",
          "=",
          "anu.id"
        );
      })
      .leftJoin("e_customer AS ec", function () {
        this.on("c.type", "=", db.raw("?", ["customer"])).andOn(
          "c.participant_id",
          "=",
          "ec.ec_id"
        );
      })
      .limit(parseInt(limit as string))
      .offset(parseInt(skip as string))
      .orderBy("c.updated_at", "desc");
    const total = await this.db("conversation").count("id as total");

    return {
      success: true,
      message: "Conversation fetched successfully",
      data,
      total: total[0].total,
    };
  }

  // Get all messages of a session
  public async getChatMessages(req: Request) {
    const { id } = req.params;
    const { limit = 100, skip = 0 } = req.query;

    const data = await this.db("chat_messages AS cm")
      .select(
        "cm.id AS message_id",
        "cm.sender_type",
        "cm.sender_id",
        "cm.message",
        "cm.files",
        "cm.created_at AS message_timestamp",
        this.db.raw(`
      CASE
          WHEN cm.sender_type = 'admin' THEN au.au_name
          WHEN cm.sender_type = 'customer' THEN ec.ec_name
          ELSE CONCAT(anu.first_name, ' ', anu.last_name)
      END AS sender_name
    `),
        this.db.raw(`
      CASE
          WHEN cm.sender_type = 'admin' THEN au.au_photo
          WHEN cm.sender_type = 'customer' THEN ec.ec_image
          ELSE null
      END AS sender_image
    `)
      )
      .leftJoin("admin_user AS au", function () {
        this.on("cm.sender_type", "=", db.raw("?", ["admin"])).andOn(
          "cm.sender_id",
          "=",
          "au.au_id"
        );
      })
      .leftJoin("e_customer AS ec", function () {
        this.on("cm.sender_type", "=", db.raw("?", ["customer"])).andOn(
          "cm.sender_id",
          "=",
          "ec.ec_id"
        );
      })
      .leftJoin("anonymous_user AS anu", function () {
        this.on("cm.sender_type", "=", db.raw("?", ["anonymous"])).andOn(
          "cm.sender_id",
          "=",
          "anu.id"
        );
      })
      .orderBy("cm.created_at", "desc")
      .limit(Number(limit))
      .offset(Number(skip));
    const total = await this.db("chat_messages").count("id as total");
    return {
      success: true,
      message: "messages fetched successfully",
      total: total[0].total,
      data,
    };
  }
}

export default ChatService;
