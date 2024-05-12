const { validationResult } = require("express-validator");
const { Patient } = require("../models");

function PatientController() {}

const create = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      data: errors.array(),
    });
  }

  try {
    const data = {
      fullname: req.body.fullname,
      phone: req.body.phone,
    };
    const doc = await Patient.create(data);
    res.status(201).json({
      success: true,
      data: doc,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const update = async (req, res) => {
  const patientId = req.params.id;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: errors.array(),
    });
  }

  try {
    const data = {
      fullname: req.body.fullname,
      phone: req.body.phone,
    };

    const doc = await Patient.updateOne({ _id: patientId }, { $set: data });

    if (!doc) {
      return res.status(404).json({
        success: false,
        message: "PATIENT_NOT_FOUND",
      });
    }

    res.json({
      success: true,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const remove = async (req, res) => {
  const id = req.params.id;

  try {
    const patient = await Patient.findOne({ _id: id });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "PATIENT_NOT_FOUND",
      });
    }

    await Patient.deleteOne({ _id: id });
    res.json({
      status: "success",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const all = async (req, res) => {
  Patient.find({})
    .then((docs) => {
      res.json({
        status: "success",
        data: docs,
      });
    })
    .catch((err) => {
      return res.status(500).json({
        success: false,
        message: err,
      });
    });
};

const show = async (req, res) => {
  const id = req.params.id;
  try {
    const patient = await Patient.findById(id).populate("appointments").exec();
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "PATIENT_NOT_FOUND",
      });
    }
    res.json({
      status: "success",
      data: { ...patient._doc, appointments: patient.appointments },
    });
  } catch (e) {
    return res.status(500).json({
      success: false,
      message: e.message,
    });
  }
};

PatientController.prototype = {
  create,
  update,
  remove,
  all,
  show,
};

module.exports = PatientController;
