export default async function SellerAuth(req,res,next) {
    try {
        // access authorize header to validate request
        const token = req.headers.authorization.split(' ')[1];
        // retrive the user details fo the logged in user
        const decodedToken = await jwt.verify(token, ENV.JWT_SECRET);

        // res.json(decodedToken)
        req.user = decodedToken;

        next()
    } catch (error) {
        res.status(401).json({ error : "Authentication Failed!"})
    }
}

export function sellerlocalVariables(req, res, next){
    req.app.locals = {
        OTP : null,
        resetSession : false
    }
    next()
}