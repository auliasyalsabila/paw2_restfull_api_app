const mongoose = require('mongoose');

const alamatSchema = new mongoose.Schema({
  jalan: String,
  rt: String,
}, { _id: false });

const pesananGalonSchema = new mongoose.Schema({
  noPesanan: { type: String, required: [true, 'nomor pesanan wajib diisi'], unique: true, trim: true },
  namaPelanggan: { type: String, required: [true, 'nama pelanggan wajib diisi'], trim: true },
  jumlahGalon: { type: Number, required: [true, 'jumlah galon wajib diisi'], min: [1, 'jumlah galon minimal 1'] },
  status: { type: String, required: [true, 'status wajib diisi'], trim: true },
  alamat: alamatSchema,
  depotId: { type: mongoose.Schema.Types.ObjectId, ref: 'Depot', required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('PesananGalon', pesananGalonSchema);