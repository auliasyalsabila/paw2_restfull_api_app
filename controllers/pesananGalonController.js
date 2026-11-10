const PesananGalon = require('../models/pesananGalonModel');
const Depot = require('../models/depotModel');
const { errorHttp } = require('../middlewares/errorHandler');

const LIMIT_DEFAULT = 10;
const LIMIT_MAKS = 50;

const FIELD_SORT = [
  'noPesanan',
  'namaPelanggan',
  'jumlahGalon',
  'status',
  'createdAt'
];

const FIELD_BOLEH_DIPILIH = [
  'noPesanan',
  'namaPelanggan',
  'jumlahGalon',
  'status',
  'alamat',
  'depotId',
  'createdAt'
];

// Mengubah bilangan dari query string menjadi bilangan bulat yang aman
function angkaAman(nilai, bawaan, min, maks) {
  const n = parseInt(nilai, 10);
  if (Number.isNaN(n)) return bawaan;
  return Math.min(Math.max(n, min), maks);
}

exports.create = async (req, res) => {
  try {
    const pesananGalon = await PesananGalon.create(req.body);
    res.status(201).json(pesananGalon);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getAll = async (req, res) => {
  const filter = {};

  // Filter berdasarkan status pesanan
  if (req.query.status) {
    filter.status = String(req.query.status).trim();
  }

  // Filter berdasarkan kode depot
  if (req.query.depot) {
    const depot = await Depot.findOne({
      kode: String(req.query.depot).toUpperCase()
    });

    // Kode depot tidak dikenal -> hasil kosong
    filter.depotId = depot ? depot._id : { $in: [] };
  }

  const page = angkaAman(
    req.query.page,
    1,
    1,
    Number.MAX_SAFE_INTEGER
  );

  const limit = angkaAman(
    req.query.limit,
    LIMIT_DEFAULT,
    1,
    LIMIT_MAKS
  );

  // Sorting: ?sort=namaPelanggan atau ?sort=-namaPelanggan
  // Bawaan: data terbaru dulu
  const sortParam = String(req.query.sort || '-createdAt');
  const arah = sortParam.startsWith('-') ? -1 : 1;
  const sortField = sortParam.replace(/^-/, '');

  if (!FIELD_SORT.includes(sortField)) {
    throw errorHttp(
      400,
      `sort hanya boleh: ${FIELD_SORT.join(', ')}`
    );
  }

  // Projection: ?fields=noPesanan,namaPelanggan
  let select = '';

  if (req.query.fields) {
    const fields = String(req.query.fields)
      .split(',')
      .map(f => f.trim());

    if (!fields.every(f => FIELD_BOLEH_DIPILIH.includes(f))) {
      throw errorHttp(
        400,
        `fields hanya boleh: ${FIELD_BOLEH_DIPILIH.join(', ')}`
      );
    }

    select = fields.join(' ');
  }

  const query = PesananGalon.find(filter)
    .select(select)
    .sort({ [sortField]: arah, _id: 1 })
    .skip((page - 1) * limit)
    .limit(limit);

  // Populate depotId jika diminta atau tidak menggunakan projection
  if (!select || select.split(' ').includes('depotId')) {
    query.populate('depotId', 'kode nama');
  }

  const [data, total] = await Promise.all([
    query,
    PesananGalon.countDocuments(filter)
  ]);

  res.json({
    data,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit)
  });
};

exports.getById = async (req, res) => {
  const data = await PesananGalon.findById(req.params.id)
    .populate('depotId');

  if (!data) {
    throw errorHttp(404, 'Data tidak ditemukan');
  }

  res.json(data);
};

exports.update = async (req, res) => {
  const data = await PesananGalon.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      returnDocument: 'after',
      runValidators: true
    }
  );

  if (!data) {
    throw errorHttp(404, 'Data tidak ditemukan');
  }

  res.json(data);
};

exports.remove = async (req, res) => {
  const data = await PesananGalon.findByIdAndDelete(req.params.id);

  if (!data) {
    throw errorHttp(404, 'Data tidak ditemukan');
  }

  res.status(204).send();
};