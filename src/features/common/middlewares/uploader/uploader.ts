import { NextFunction, Request, Response } from "express";
import multer from "multer";
import multerS3 from "multer-s3";
import path from "path";
import config from "../../../../utils/config/config";
import CustomError from "../../../../utils/lib/customError";
import { ROOT_FOLDER } from "../../../../utils/miscellaneous/constants";
import CommonAbstractStorage from "../../commonAbstract/common.abstract.storage";
import Wrapper from "../asyncWrapper/wrapper";
const allowed_file_types: string[] = [
  "image/jpeg",
  "application/octet-stream",
  "image/jpg",
  "image/JPG",
  "image/JPEG",
  "image/png",
  "image/webp",
  "application/postscript",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/gif",
];

class Uploader extends CommonAbstractStorage {
  private wrapper: Wrapper;
  constructor() {
    super();
    this.wrapper = new Wrapper();
  }

  public storageUploadRaw(folder: string) {
    return (req: Request, res: Response, next: NextFunction): void => {
      req.upFiles = [];
      const upload = multer({
        storage: multerS3({
          acl: "public-read",
          s3: this.s3Client,
          contentType: multerS3.AUTO_CONTENT_TYPE,
          bucket: config.AWS_S3_BUCKET,
          metadata: function (_req, file, cb) {
            cb(null, { fieldName: file.fieldname });
          },
          key: function (req, file, cb) {
            const uniqueName =
              Date.now() +
              "-" +
              Math.round(Math.random() * 1e9) +
              path.extname(file.originalname);
            file.filename = `${folder}/${uniqueName}`;
            req.upFiles.push({ filename: uniqueName, folder: folder });
            cb(null, `${ROOT_FOLDER}/${folder}/${uniqueName}`);
          },
        }),
        fileFilter: function (req, file, cb) {
          console.log(file);
          // Check allowed extensions
          const isAllowedExt = allowed_file_types.includes(file.mimetype);
          if (isAllowedExt) {
            cb(null, true); // no errors
          } else {
            // pass error msg to callback, which can be displaye in frontend
            cb(new Error("File type not allowed!"));
          }
        },
      });

      upload.any()(req, res, (err) => {
        console.log(req.files);
        if (err) {
          next(new CustomError(err.message, 500, "Upload failed"));
        } else {
          next();
        }
      });
    };
  }
}
export default Uploader;
