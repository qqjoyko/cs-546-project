const multer = require("multer");
const { GridFsStorage } = require("multer-gridfs-storage");
const dbConfig = require("../config/mongoConnection").dbConfig;
const dbConnection = require("../config/mongoConnection");
let { ObjectId } = require("mongodb");
const GridFSBucket = require("mongodb").GridFSBucket;

var storage = new GridFsStorage({
  url: dbConfig.serverUrl + dbConfig.database,
  file: (req, file) => {
    if (file.mimetype !== "application/pdf") {
      const filename = `${Date.now()}-user-${file.originalname}`;
      return null;
    }

    return {
      bucketName: dbConfig.userBucket,
      filename: `${Date.now()}-user-${file.originalname}`,
    };
  },
});

var uploadFiles = multer({ storage: storage });

const download = async (fileId) => {
  if (!ObjectId.isValid(fileId)) {
    throw new CustomError(400, "Invalid fileId");
  } else {
    fileId = ObjectId(fileId);
  }

  const db = await dbConnection.connectToDb();
  const bucket = new GridFSBucket(db, {
    bucketName: dbConfig.userBucket,
  });
  let downloadStream = bucket.openDownloadStream(fileId);
  return downloadStream;
};

module.exports = { upload: uploadFiles, download: download };
