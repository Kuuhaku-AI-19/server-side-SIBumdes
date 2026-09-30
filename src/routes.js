const express = require('express')
const router = express.Router()

const useRoute = require('./modules/users/user.route')
const KantorPusatRoute = require('./modules/kantor_pusat/kantor_pusat.router')
const resikRoute = require('./modules/resik/resik.router')
const internetRoute = require('./modules/internet/internet.router')
const authRouter = require('./modules/auth/auth.router')
const niagaRoute = require('./modules/niaga/niaga.router')
const minaRoute = require('./modules/mina/mina.router')
const rekeningRoute = require('./modules/rekening/rekening.router')
const NotFound = require('./error/NotfoundError')

router.use('/users', useRoute)
router.use('/kantor', KantorPusatRoute)
router.use('/resik', resikRoute)
router.use('/internet', internetRoute)
router.use('/auth', authRouter)
router.use('/niaga', niagaRoute)
router.use('/mina', minaRoute)
router.use('/rekening', rekeningRoute)


router.use((req, res) => {
    throw new NotFound('Route Tidak Di Temukan')
})


module.exports = router