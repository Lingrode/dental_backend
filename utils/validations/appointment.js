const { check, validationResult } = require("express-validator");

const isValidToothNumber = (value) => {
  const strValue = String(value);
  const validNumbers = [
    "11",
    "12",
    "13",
    "14",
    "15",
    "16",
    "17",
    "18",
    "21",
    "22",
    "23",
    "24",
    "25",
    "26",
    "27",
    "28",
    "31",
    "32",
    "33",
    "34",
    "35",
    "36",
    "37",
    "38",
    "41",
    "42",
    "43",
    "44",
    "45",
    "46",
    "47",
    "48",
  ];
  return validNumbers.includes(strValue);
};

const validation = {
  create: [
    check("toothNumber")
      .custom(isValidToothNumber)
      .withMessage("Invalid tooth number"),
    check("price").isInt({ min: 0, max: 100000 }),
    check("diagnosis").isLength({ min: 3, max: 50 }),
    check("date").isLength({ min: 3, max: 50 }),
    check("time").isLength({ min: 3, max: 50 }),
    check("patient").isLength({ min: 3, max: 50 }),
  ],
  update: [
    check("toothNumber")
      .custom(isValidToothNumber)
      .withMessage("Invalid tooth number"),
    check("price").isInt({ min: 0, max: 100000 }),
    check("diagnosis").isLength({ min: 3, max: 50 }),
    check("date").isLength({ min: 3, max: 50 }),
    check("time").isLength({ min: 3, max: 50 }),
  ],
};

module.exports = validation;
