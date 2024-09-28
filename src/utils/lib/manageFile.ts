import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs";
import CommonAbstractStorage from "../../common/commonAbstract/common.abstract.storage";
import config from "../config/config";
import { ROOT_FOLDER } from "../miscellaneous/constants";

class ManageFile extends CommonAbstractStorage {
  constructor() {
    super();
  }

  // delete from storage
  public deleteFromStorage = async (
    files: {
      filename: string;
      folder: string;
    }[]
  ) => {
    try {
      if (files.length) {
        for await (const file of files) {
          const deleteParams = {
            Bucket: config.AWS_S3_BUCKET,
            Key: `${ROOT_FOLDER}/${file.folder}/${file.filename}`,
          };

          const res = await this.s3Client.send(
            new DeleteObjectCommand(deleteParams)
          );
          console.log({ res });
          console.log("file deleted -> ", files);
        }
      }
    } catch (err) {
      console.log({ err });
    }
  };

  // delete file
  public delete = async (dir: string, files: string | string[]) => {
    console.log({ dir });
    try {
      if (typeof files === "string") {
        const strPath = `${__dirname}/../../../uploads/${dir}/${files}`;
        await fs.promises.unlink(strPath);
      } else if (files && files.length >= 1) {
        for (let i = 0; i < files.length; i++) {
          const filename = files[i];
          const path = `${__dirname}/../../../uploads/${dir}/${filename}`;
          await fs.promises.unlink(path);
        }
      } else {
        return;
      }
    } catch (err) {
      console.log({ err });
    }
  };

  // copy file
  public copyfile = async (source: string, target: string, file: string) => {
    try {
      const fileSource = `${__dirname}/../../../uploads/${source}/${file}`;
      const fileTarget = `${__dirname}/../../../uploads/${target}/${file}`;

      console.log({ fileSource, fileTarget });
      fs.copyFile(fileSource, fileTarget, (err) => {
        console.log(err);
      });
    } catch (err) {
      console.log(err);
    }
  };

  // aws upload buffer
  public async awsUploadBuffer(buffer: Buffer, name: string) {
    try {
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: config.AWS_S3_BUCKET,
          Key: `${ROOT_FOLDER}/${name}`,
          Body: buffer,
          ACL: "public-read",
        })
      );
    } catch (err) {
      console.log(err);
    }
  }
}

export default ManageFile;
