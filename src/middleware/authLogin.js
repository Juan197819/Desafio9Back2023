export function authLogin1(req, res, next) {
    if ( req.session.user) {
        next()
    } else {
        res.status(401).redirect('/login')
    }
}
export function authLogin2(req, res, next) {
    if ( !req.session.user) {
        next()
    } else {
        res.status(200).redirect('/')
    }
}