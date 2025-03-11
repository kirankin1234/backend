const Consumer = require('../models/Consumer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');


// Register Consumer
exports.registerConsumer = async(req, res) => {
    try {
        console.log("Received Data:", req.body);

        const {
            firstName,
            lastName,
            email,
            password,
            confirmPassword,
            phoneNumber,
            addressLine1,
            addressLine2,
            city,
            country,
            state,
            zip
        } = req.body;

        // Check for required fields
        if (!firstName || !lastName || !email || !password || !confirmPassword) {
            return res.status(400).json({ message: "All required fields must be filled" });
        }

        // Check if passwords match
        if (password !== confirmPassword) {
            return res.status(400).json({ message: "Passwords do not match" });
        }

        // Check if user already exists
        const existingUser = await Consumer.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Hash the password before storing
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new consumer
        const newConsumer = new Consumer({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            phoneNumber,
            addressLine1,
            addressLine2,
            city,
            country,
            state,
            zip
        });

        await newConsumer.save();

        console.log("New Consumer:", newConsumer);

        // Generate JWT token
        const token = jwt.sign({ _id: newConsumer._id, email: newConsumer.email },
            process.env.JWT_SECRET, { expiresIn: '1h' }
        );

        return res.status(201).json({
            message: "User registered successfully",
            token,
            user: {
                _id: newConsumer._id,
                firstName: newConsumer.firstName,
                lastName: newConsumer.lastName,
                email: newConsumer.email,
                phoneNumber: newConsumer.phoneNumber
            }
        });

    } catch (error) {
        console.error("Registration Error:", error);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Login Consumer
exports.loginConsumer = async(req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const consumer = await Consumer.findOne({ email });
        if (!consumer) {
            return res.status(400).json({ message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(password, consumer.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: consumer._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

        return res.status(200).json({
            token,
            message: 'Consumer logged in successfully',
            user: consumer
        });

    } catch (error) {
        console.error('Login Error:', error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Fetch All Consumers

// ✅ Fetch Consumers
exports.getConsumers = async(req, res) => {
    try {
        const consumers = await Consumer.find({}, 'firstName lastName email phoneNumber');

        if (!consumers || consumers.length === 0) {
            return res.status(404).json({ message: "No consumers found" });
        }

        console.log("Fetched Consumers:", consumers); // Debugging

        const formattedConsumers = consumers.map(consumer => ({
            _id: consumer._id,
            fullName: `${consumer.firstName} ${consumer.lastName}`,
            email: consumer.email,
            phoneNumber: consumer.phoneNumber
        }));

        console.log("Formatted Consumers:", formattedConsumers);
        return res.status(200).json(formattedConsumers);
    } catch (error) {
        console.error('Error fetching consumers:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};


// Fetch Single Consumer Profile by ID
exports.getConsumerProfile = async(req, res) => {
    try {
        const { userId } = req.params;
        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        const consumer = await Consumer.findById(userId);
        if (!consumer) {
            return res.status(404).json({ message: 'User not found' });
        }

        return res.status(200).json({ user: consumer });
    } catch (error) {
        console.error("Error fetching consumer profile:", error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Update Consumer Profile by ID
exports.updateConsumerProfile = async(req, res) => {
    try {
        const { userId } = req.params;
        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        const updatedConsumer = await Consumer.findByIdAndUpdate(userId, req.body, { new: true });
        if (!updatedConsumer) {
            return res.status(404).json({ message: 'User not found' });
        }

        return res.status(200).json({ message: 'Profile updated successfully', user: updatedConsumer });
    } catch (error) {
        console.error("Error updating consumer profile:", error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};




exports.forgotPassword = async(req, res) => {
    try {
        const { email } = req.body;
        const user = await Consumer.findOne({ email });

        if (!user) return res.status(400).json({ message: "User not found" });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '15m' });

        // 📩 Send email with reset link
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false, // or 'STARTTLS'
            auth: {
                user: "kiran899964@gmail.com",
                pass: "djjy kbog dxqq npyx" // Use App Password if 2-Step Verification is enabled
            }
        });

        const mailOptions = {
            from: 'kiran899964@gmail.com',
            to: user.email,
            subject: 'Password Reset',
            html: `
                <p>Hello ${user.firstName || ''},</p>
                <p>You recently requested to reset your password. Please click the link below to reset it:</p>
                <a href="https://cleaningequipment.vercel.app/reset-password/${token}" style="background-color:#40476D; color:white; width:120px; border-radius:3px; border:none; padding:10px; text-decoration:none;">Reset Password</a>
                <p>This link will expire in 15 minutes. If you did not request a password reset, please ignore this email or contact our support team immediately.</p>
                <p>Thank you,<br>Your Support Team</p>
            `,
        };

        // Send email and handle potential errors
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error("Error sending email:", error);
                res.status(500).json({ message: "Failed to send email. Please check your email or try again later." });
            } else {
                console.log("Email sent: " + info.response);
                res.status(200).json({ message: "Password reset link sent to email" });
            }
        });

    } catch (error) {
        console.error("Error processing request:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};






exports.resetPassword = async(req, res) => {
    try {
        const { token } = req.params;
        const { newPassword, confirmPassword } = req.body;

        // Ensure both passwords match before proceeding
        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: "Passwords do not match" });
        }

        // Verify token and get user id
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await Consumer.findById(decoded.id);
        if (!user)
            return res.status(400).json({ message: "Invalid token" });

        // Hash new password and update
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        res.status(200).json({ message: "Password reset successfully" });
    } catch (error) {
        res.status(500).json({ message: "Invalid or expired token" });
    }
};