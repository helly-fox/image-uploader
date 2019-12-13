const AWS = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');

AWS.config.update({
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  region: process.env.AMAZON_REGION,
});

const snsParams = {
  Protocol: 'EMAIL', /* required */
  TopicArn: process.env.SNS_TOPIC, /* required */
};
const sns = new AWS.SNS();
const s3 = new AWS.S3();

const uploader = multer({ // https://github.com/expressjs/multer
  storage: multerS3({
    s3,
    dirname: '/',
    bucket: process.env.BUCKET_NAME,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    region: process.env.AMAZON_REGION,
    acl: 'public-read',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    filename: function (req, file, cb) {
      cb(null, file.originalname); //use Date.now() for unique file keys
    }
  })
});

const pushMessageToSns = message => {
  const messageParams = {
    Message: message,
    TopicArn: process.env.SNS_TOPIC,
  };

  return sns.publish({...messageParams}).promise()
};

const unsubscribeForTopic = email => {
  return sns.listSubscriptionsByTopic({ TopicArn: process.env.SNS_TOPIC })
    .promise()
    .then(subscribersList => {
      const subscriberByEmail = subscribersList.Subscriptions.find(i => i.Endpoint === email);
      if (subscriberByEmail) {
        return sns.unsubscribe({ SubscriptionArn: subscriberByEmail.SubscriptionArn }).promise();
      } else {
        throw new Error('No such user');
      }
    })
};

const subscribeToTopic = email => {
  return sns.subscribe({...snsParams, Endpoint: email}).promise();
};

module.exports = {
  pushMessageToSns,
  unsubscribeForTopic,
  subscribeToTopic,
  uploader,
};