const Depot = require('../models/depotModel');

exports.create = async (req, res) => {
  try {
    const depot = await Depot.create(req.body);
    res.status(201).json(depot);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getAll = async (req, res) => {
  res.json(await Depot.find());
};
