const getRandomImg = (onError, onSuccess) =>
  global.connection.query(`SELECT url, title FROM images ORDER BY RAND() LIMIT 1;`, (err, result) => {
    if (err) {
      onError(err);
    } else {
      onSuccess(result[0]);
    }
  });

const insertImageData = (file, onError, onSuccess) => {
  if (!file) {
    onError(new Error('no file chosen'));
  }

  return global.connection.query(`INSERT into images (url, title) VALUES ('${file.location}', '${file.key}')`, (err, results) => {
    if (err) {
      return onError(err);
    } else {
      return onSuccess();
    }
  });
};

const selectImgByTitle = (img, onError, onSuccess) =>
  global.connection.query(`SELECT url, title FROM images where title='${img}' LIMIT 1;`, (err, result) => {
    return err ? onError(err) : onSuccess(result[0]);
  });


module.exports = {
  getRandomImg,
  insertImageData,
  selectImgByTitle
};
