const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Helper: Buat nama file ramah dan unik
function generateFilename(originalname) {
  const name = path.parse(originalname).name;
  const ext = path.extname(originalname);
  const slugified = name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-') // Ganti spasi dan simbol jadi -
    .replace(/-+/g, '-')         // Hapus duplikat tanda -
    .replace(/^-|-$/g, '');      // Hapus - di awal/akhir

  return `${slugified}-${Date.now()}${ext}`;
}

// Bikin folder kalau belum ada
const ensureDirExist = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Storage untuk missing person
const missingPersonStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/missing-person-photos';
    ensureDirExist(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const filename = generateFilename(file.originalname);
    cb(null, filename);
  }
});

// Storage untuk found person
const foundPersonStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/found-person-photos';
    ensureDirExist(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const filename = generateFilename(file.originalname);
    cb(null, filename);
  }
});

// Storage untuk berita
const newsStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/news-photos';
    ensureDirExist(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const filename = generateFilename(file.originalname);
    cb(null, filename);
  }
});

const uploadMissing = multer({ storage: missingPersonStorage });
const uploadFound = multer({ storage: foundPersonStorage });
const uploadNewsImage = multer({ storage: newsStorage });

module.exports = {
  uploadMissing,
  uploadFound,
  uploadNewsImage
};
