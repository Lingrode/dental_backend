const { validationResult } = require("express-validator");

const dayjs = require("dayjs");
const uaLocale = require("dayjs/locale/uk");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");

const { groupBy, reduce } = require("lodash");

const { Appointment, Patient } = require("../models");

const { sendSMS } = require("../utils");

dayjs.extend(utc);
dayjs.extend(timezone);

function AppointmentController() {}

const create = async (req, res) => {
  const errors = validationResult(req);
  let patient;

  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      data: errors.array(),
    });
  }

  try {
    const data = {
      patient: req.body.patient,
      toothNumber: req.body.toothNumber,
      diagnosis: req.body.diagnosis,
      price: req.body.price,
      date: req.body.date,
      time: req.body.time,
    };

    patient = await Patient.findOne({ _id: data.patient });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "PATIENT_NOT_FOUND",
      });
    }

    const doc = await Appointment.create(data);
    res.status(201).json({
      success: true,
      data: doc,
    });

    // const delayedTime = dayjs(
    //   `${data.date
    //     .split('.')
    //     .reverse()
    //     .join('-')}T${data.time}`,
    // )
    //   .subtract(1, 'hour')
    //   .format('YYYY-MM-DD HH:mm');

    // sendSMS({
    //   number: patient.phone,
    //   time: delayedTime,
    //   text: `Доброго дня, ${patient.fullname}! Сьогодні в ${data.time} у вас прийом в стоматологію "Dental"`
    // }).then(({ data }) => {
    //   console.log(data);
    // });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const update = async (req, res) => {
  const appointmentId = req.params.id;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: errors.array(),
    });
  }

  try {
    const data = {
      toothNumber: req.body.toothNumber,
      diagnosis: req.body.diagnosis,
      price: req.body.price,
      date: req.body.date,
      time: req.body.time,
    };

    // const appointment = await Appointment.findOne({ _id: appointmentId });

    // if (!appointment) {
    //   return res.status(404).json({
    //     success: false,
    //     message: 'PATIENT_NOT_FOUND'
    //   })
    // }

    const doc = await Appointment.updateOne(
      { _id: appointmentId },
      { $set: data }
    );

    if (!doc) {
      return res.status(404).json({
        success: false,
        message: "APPOINTMENT_NOT_FOUND",
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
    const patient = await Appointment.findOne({ _id: id });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "APPOINTMENT_NOT_FOUND",
      });
    }

    await Appointment.deleteOne({ _id: id });
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

const all = async function (req, res) {
  Appointment.find({})
    .populate("patient")
    .exec()
    .then((docs) => {
      docs = docs.filter((doc) => {
        const appointmentDateTime = dayjs(
          doc.date + " " + doc.time,
          "YYYY-MM-DD HH:mm"
        )
          .add(30, "minute")
          .tz("Europe/Kiev");
        return appointmentDateTime.isAfter(dayjs().tz("Europe/Kiev"));
      });

      res.json({
        status: "success",
        data: reduce(
          groupBy(docs, "date"),
          (result, value, key) => {
            result = [
              ...result,
              {
                title: dayjs(key).locale(uaLocale).format("D MMMM"),
                originalDate: key,
                data: value,
              },
            ];
            return result;
          },
          []
        ),
      });
    })
    .catch((err) => {
      return res.status(500).json({
        success: false,
        message: err,
      });
    });
};

AppointmentController.prototype = {
  all,
  create,
  remove,
  update,
};

module.exports = AppointmentController;
