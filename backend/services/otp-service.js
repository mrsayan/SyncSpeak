const crypto = require('crypto');
const hashService = require('./hash-service');

const smsSid = process.env.SMS_SID;
const smsAuthToken = process.env.SMS_AUTH_TOKEN;
const twilio = require('twilio')(smsSid, smsAuthToken, {
    lazyLoading: true,
});

/**
 * A service for generating and verifying OTPs (One-Time Passwords).
 */
class OtpService {
    /**
     * Generates a random 4-digit OTP.
     * @returns {Promise<number>} A promise that resolves to the generated OTP.
     */
    async generateOtp() {
        const otp = crypto.randomInt(1000, 9999);
        return otp;
    }

    /**
     * Sends the given OTP to the specified phone number via SMS.
     * @param {string} phone - The phone number to send the OTP to.
     * @param {number} otp - The OTP to send.
     * @returns {Promise<object>} A promise that resolves to the Twilio message object.
     */
    async sendBySms(phone, otp) {
        return await twilio.messages.create({
            to: phone,
            from: process.env.SMS_FROM_NUMBER,
            body: `Your SyncSpeak OTP is ${otp}`,
        });
    }

    /**
     * Verifies the given OTP against the provided data.
     * @param {string} hashedOtp - The hashed OTP to verify against.
     * @param {string} data - The data to hash and compare against the hashed OTP.
     * @returns {boolean} Whether the provided OTP matches the hashed OTP.
     */
    verifyOtp(hashedOtp, data) {
        let computedHash = hashService.hashOtp(data);
        return computedHash === hashedOtp;
    }
}

module.exports = new OtpService();
