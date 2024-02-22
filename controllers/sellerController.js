import sellerModel from '../model/Seller.model.js'
import bcrypt from 'bcrypt'
// helper function
function generatePassword() {
    var length = 8,
        charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
        retVal = "";
    for (var i = 0, n = charset.length; i < length; ++i) {
        retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    return retVal;
}

/** POST: http://localhost:8080/api/registerseller
* @param : {
    "password" : "admin123",
    "OwnerEmail": "example@gmail.com",
    "OwnerName" : "bill",
    "OwnerNumber": 8009860560,
    "OwnerProfile": "" (not compuslory)
}
*/
export async function registerseller(req, res) {
    try {
        const { OwnerEmail, OwnerName, OwnerNumber, OwnerProfile} = req.body;

        // check for existing mobile number
        const existMobile = sellerModel.findOne({ OwnerNumber }).exec();

        // check for existing email
        const existEmail = sellerModel.findOne({ OwnerEmail }).exec();

        // Checking for existing mobile and email
        const [mobileExist, emailExist] = await Promise.all([existMobile, existEmail]);

        if (mobileExist) {
            return res.status(400)
        }

        if (emailExist) {
            return res.status(400)
        }
        let password = generatePassword()
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            const seller = new sellerModel({
                password: hashedPassword,
                OwnerProfile: OwnerProfile || '',
                OwnerEmail, 
                OwnerName, 
                OwnerNumber
            });

            // Save the seller
            await seller.save();
            // Send response with _id and email
            return res.status(201)
        }
    } catch (error) {
        console.log(error);
        return res.status(500);
    }
}