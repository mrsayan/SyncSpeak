const userService = require('../services/user-service');
const tokenService = require('../services/token-service');
const UserDto = require('../dtos/user-dto');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const cors = require("cors")({origin: true});

const client = require('twilio')(accountSid, authToken, {
    lazyLoading: true,
});

class AuthController {
    // Twilio Verify API v2

    async sendOtp(req, res) {
        res.header('Access-Control-Allow-Origin', 'http://localhost:3000');

        const { phone } = req.body;
        if (!phone) {
            res.status(400).json({ message: 'Phone number is required!' });
        }

        try {
            const verification = await client.verify.v2
                .services(process.env.TWILIO_VERIFY_SERVICE_SID)
                .verifications.create({ to: phone, channel: 'sms' });
            res.json({ message: 'Verification is sent!' });
        } catch (err) {
            console.log(err);
            res.status(500).json({ message: 'Server error' });
        }
    }

    async verifyOtp(req, res) {
        const { phone, code } = req.body;
        if (!phone || !code) {
            res.status(400).json({ message: 'Phone and code are required!' });
        }
        /*
        JSON Request Body
        {
            "phone": "+380123456789",
            "code": "123456"

        */

        try {
            const verification = await client.verify.v2
                .services(process.env.TWILIO_VERIFY_SERVICE_SID)
                .verificationChecks.create({ to: phone, code });
            if (verification.status === 'approved') {
                let user;
                try {
                    user = await userService.findUser({ phone });
                    if (!user) {
                        user = await userService.createUser({ phone });
                    }
                } catch (err) {
                    console.log(err);
                    res.status(500).json({ message: 'Db error' });
                }

                const { accessToken, refreshToken } = tokenService.generateTokens({
                    _id: user._id,
                    activated: false,
                });

                await tokenService.storeRefreshToken(refreshToken, user._id);

                res.cookie('refreshToken', refreshToken, {
                    maxAge: 1000 * 60 * 60 * 24 * 30,
                    httpOnly: true,
                });

                res.cookie('accessToken', accessToken, {
                    maxAge: 1000 * 60 * 60 * 24 * 30,
                    httpOnly: true,
                });

                const userDto = new UserDto(user);
                res.json({ user: userDto, auth: true });
            }
            else
            {
                res.status(400).json({ message: 'Invalid code' });
            }
        }
        catch (err) {
            console.log(err);
            res.status(500).json({ message: 'Server error' });
        }
    }

    async refresh(req, res) {
        // get refresh token from cookie
        res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
        const { refreshToken: refreshTokenFromCookie } = req.cookies;
        // check if token is valid
        let userData;
        try {
            userData = await tokenService.verifyRefreshToken(
                refreshTokenFromCookie
            );
        } catch (err) {
            return res.status(401).json({ message: 'Invalid Token' });
        }
        // Check if token is in db
        try {
            const token = await tokenService.findRefreshToken(
                userData._id,
                refreshTokenFromCookie
            );
            if (!token) {
                return res.status(401).json({ message: 'Invalid token' });
            }
        } catch (err) {
            return res.status(500).json({ message: 'Internal error' });
        }
        // check if valid user
        const user = await userService.findUser({ _id: userData._id });
        if (!user) {
            return res.status(404).json({ message: 'No user' });
        }
        // Generate new tokens
        const { refreshToken, accessToken } = tokenService.generateTokens({
            _id: userData._id,
        });

        // Update refresh token
        try {
            await tokenService.updateRefreshToken(userData._id, refreshToken);
        } catch (err) {
            return res.status(500).json({ message: 'Internal error' });
        }
        // put in cookie
        res.cookie('refreshToken', refreshToken, {
            maxAge: 1000 * 60 * 60 * 24 * 30,
            httpOnly: true,
        });

        res.cookie('accessToken', accessToken, {
            maxAge: 1000 * 60 * 60 * 24 * 30,
            httpOnly: true,
        });
        // response
        const userDto = new UserDto(user);
        res.json({ user: userDto, auth: true });
    }

    async logout(req, res) {
        const { refreshToken } = req.cookies;
        // delete refresh token from db
        await tokenService.removeToken(refreshToken);
        // delete cookies
        res.clearCookie('refreshToken');
        res.clearCookie('accessToken');
        res.json({ user: null, auth: false });
    }
}

module.exports = new AuthController();
