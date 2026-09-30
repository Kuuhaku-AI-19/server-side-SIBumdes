const { body, param } = require('express-validator')


const createUserValidator = [
    body('name')
        .notEmpty().withMessage('Nama Wajib Di isi')
        .isString().withMessage("Nama harus berupa String")
        .escape()
        .isLength({ max: 255 }).withMessage("Maksimal Panjang Nama 255 Karakter"),
    body('email')
        .notEmpty().withMessage("Email wajib Di isi")
        .isEmail().withMessage("Format Email Tidak Valid")
        .isLength({ max: 255}).withMessage("Maksimal Panjang Email 255 Karakter"),
    body('number')
        .notEmpty().withMessage("Number wajib di isi")
        .isMobilePhone('id-ID').withMessage("Nomor Telepon Tidak Valid"),
    body('password')
        .notEmpty().withMessage("Password Wajib Di Isi")
        .isLength({ max: 255}).withMessage("Maksimal Panjang Password 255 Karakter")
];

const updateUserValidator = [
    param('id')
        .isInt().withMessage("ID Harus berupa angka"),
        
    body('name')
        .notEmpty().withMessage('Nama Wajib Di isi')
        .isString().withMessage("Nama harus berupa String")
        .escape()
        .isLength({ max: 255 }).withMessage("Maksimal Panjang Nama 255 Karakter"),
    body('email')
        .notEmpty().withMessage("Email wajib Di isi")
        .isEmail().withMessage("Format Email Tidak Valid")
        .isLength({ max: 255}).withMessage("Maksimal Panjang Email 255 Karakter"),
    body('number')
        .notEmpty().withMessage("Number wajib di isi")
        .isMobilePhone('id-ID').withMessage("Nomor Telepon Tidak Valid"),
    body('password')
        .notEmpty().withMessage("Password Wajib Di Isi")
        .isLength({ max: 255}).withMessage("Maksimal Panjang Password 255 Karakter")
]

const idParamValidator = [
    param('id')
        .isInt().withMessage("ID harus berupa angka")
]

module.exports = {
    createUserValidator,
    updateUserValidator,
    idParamValidator
}