import multer from 'multer';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 250 * 1024 * 1024, // 250MB
  },
  fileFilter: (req, file, cb) => {
    // opcional: valida tipos permitidos
    const allowed = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'application/zip',
      'application/x-zip-compressed'
    ];

    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de arquivo não permitido'), false);
    }
  }
});

export default upload;
