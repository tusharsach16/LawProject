"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginUser = exports.signupUser = exports.getUser = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../models/User");
const Lawyer_1 = require("../models/Lawyer");
const LawStudent_1 = require("../models/LawStudent");
const GeneralUser_1 = require("../models/GeneralUser");
const signupUser = async (req, res) => {
    try {
        const _a = req.body, { name, lastname, username, email, phoneNumber, password, role } = _a, extraData = __rest(_a, ["name", "lastname", "username", "email", "phoneNumber", "password", "role"]);
        const existingUser = await User_1.User.findOne({ email });
        if (existingUser) {
            res.status(400).json({ message: 'Email already in use' });
            return;
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const user = await User_1.User.create({
            name,
            lastname,
            username,
            email,
            phoneNumber,
            password: hashedPassword,
            role
        });
        if (role === 'lawyer') {
            await Lawyer_1.Lawyer.create(Object.assign({ userId: user._id }, extraData));
        }
        else if (role === 'lawstudent') {
            await LawStudent_1.LawStudent.create(Object.assign({ userId: user._id }, extraData));
        }
        else {
            await GeneralUser_1.GeneralUser.create(Object.assign({ userId: user._id }, extraData));
        }
        res.status(201).json({ message: 'Signup successful', user });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.signupUser = signupUser;
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User_1.User.findOne({ email });
        if (!user) {
            res.status(400).json({ message: 'Invalid credentials' });
            return;
        }
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            res.status(400).json({ message: 'Invalid credentials' });
            return;
        }
        const _a = user.toObject(), { password: _ } = _a, userData = __rest(_a, ["password"]);
        const token = jsonwebtoken_1.default.sign({ id: user._id, role: user.role, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.status(200).json({ message: 'Login successful', token, user: userData });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.loginUser = loginUser;
const getUser = async (req, res) => {
    try {
        const userId = req.user.id; // Type-cast to access custom `user` property
        const user = await User_1.User.findById(userId).select('-password');
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        res.status(200).json({ user });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getUser = getUser;
