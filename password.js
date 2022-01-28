const bcrypt = require('bcryptjs');

const HashPassword = async (inputPassword) => {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('re1dn4H' + inputPassword + 'drowss4P', salt)
    return hashedPassword;
}

const ComparePassword = async (inputPassword, userPassword) => {
    const validPass = await bcrypt.compare('re1dn4H' + inputPassword + 'drowss4P', userPassword);
    return validPass;
}

module.exports.hashPassword = HashPassword;
module.exports.comparePassword = ComparePassword;