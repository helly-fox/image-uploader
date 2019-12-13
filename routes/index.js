const express = require('express');
const router = express.Router();
const {
  pushMessageToSns,
  unsubscribeForTopic,
  subscribeToTopic,
  uploader
} = require('../services/index');
const {
  getRandomImg,
  insertImageData,
  selectImgByTitle,
} = require('../services/dbService');


/* GET users listing. */
router
  .get('/random', (req, res) =>
    getRandomImg(
      err => res.render('error', {'status': 500, 'stack': err.stack, 'message': err.message}),
      result => res.render('image', result)
    )
  )
  .post('/upload', uploader.single('photo'), (req, res) =>
    insertImageData(
      req.file,
      err => res.render('error', {'status': 500, 'stack': err.stack, 'message': err.message}),
      () => pushMessageToSns('New Image was uploaded')
        .then(() => {
          res.render('image', {title: req.file.key, url: req.file.location});
        })
    )
  )
  .get('/subscribe', (req, res) => res.render('subscribe', {title: 'Subscribtion page'}))
  .post('/subscribe', (req, res) => {
    if (req.body.email) {
      subscribeToTopic(req.body.email).then(
        data =>
          res.render('notification', {message: 'Subscription ARN is ' + data.SubscriptionArn})
      ).catch(err => {
        res.render('error', {'status': 500, 'stack': err.stack, 'message': err.message})
      });
    } else {
      res.render('error', {'status': 500, 'stack': '', 'message': 'Enter a valid Email'})
    }
  })
  .get('/unsubscribe', (req, res) => res.render('unsubscribe', {title: 'Unsubscribe page'}))
  .post('/unsubscribe', (req, res) => {
    if (req.body.email) {
      unsubscribeForTopic(req.body.email)
        .then(() => res.render('notification', 'UnSubscribe successfully'))
        .catch(err => res.render('error', {'status': 500, 'stack': err.stack, 'message': err.message}));
    } else {
      res.render('error', {'status': 500, 'stack': '', 'message': 'Enter valid email'});
    }
  })
  .get('/:img', (req, res) => {
    selectImgByTitle(
      req.params.img,
      err => res.render('error', {'status': 500, 'stack': err.stack, 'message': err.message}),
      result => res.render('image', result)
    );
  })
  .get('/', (req, res) => res.render('index', {title: 'Image Uploader to S3'}));

module.exports = router;
