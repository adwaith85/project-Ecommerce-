import Usermodel from "../model/userModel.js"
import Order from "../model/order.js"
import jwt from 'jsonwebtoken'

export const register = async (req, res) => {
    const { email, password, name, number } = req.body

    try {
        const existingUser = await Usermodel.findOne({ email })
        if (existingUser) {
            return res.status(400).json({ error: "User already exists" })
        }

        await Usermodel.create({ email, password, name, number })
        res.status(201).json({ message: "Registration successful" })
    } catch (error) {
        console.error("Registration error:", error)
        res.status(500).json({ error: "Internal server error" })
    }
}

export const login = async (req, res) => {
    const { email, password } = req.body

    const user = await Usermodel.findOne({ email: email })

    if (user) {
        const isMatch = await user.comparePassword(password)

        if (isMatch) {
            const token = jwt.sign({ email: user.email, role: user.role }, 'qwerty', { expiresIn: '24h' });

            // Ensure only one user is "Login" at a time by logging out others
            await Usermodel.updateMany({ email: { $ne: email } }, { status: "Logout" });

            // Update status to Login
            user.status = "Login";
            await user.save();

            res.json({
                status: "login done",
                token: token
            })
        } else {
            res.status(401).json({ error: "Wrong password" })
        }
    } else {
        res.status(404).json({ error: "No user found" })
    }


}



export const getUser = async (req, res) => {
    try {
        const user = await Usermodel.findOne({ email: req.user.email })
        if (user && user.status !== "Login") {
            user.status = "Login";
            await user.save();
        }
        res.json(user)
    }
    catch (err) {
        console.log(err)
        res.status(500).json({ error: "Failed to fetch user" })
    }
}

export const updateUser = async (req, res) => {
    try {
        console.log("Update User Request Received");
        console.log("Body:", req.body);
        console.log("File:", req.file);
        console.log("User from token:", req.user);

        const { name, number } = req.body || {};
        const updateData = {};

        if (name && name !== "undefined") updateData.name = name;
        if (number && number !== "undefined") updateData.number = number;

        if (req.file) {
            updateData.profileImage =
                `http://localhost:8000/uploads/${req.file.filename}`;
            console.log("New Profile Image URL:", updateData.profileImage);
        }

        if (Object.keys(updateData).length === 0) {
            console.log("No data to update");
            return res.status(400).json({ error: "No changes provided" });
        }

        const user = await Usermodel.findOneAndUpdate(
            { email: req.user.email },
            { $set: updateData },
            { new: true }
        );

        if (!user) {
            console.log("User not found for email:", req.user.email);
            return res.status(404).json({ error: "User not found" });
        }

        console.log("User updated successfully");
        res.json(user);
    } catch (err) {
        console.error("Update User Error:", err);
        res.status(500).json({ error: "Failed to update user" });
    }
};

export const getAllUsers = async (req, res) => {
    try {
        const users = await Usermodel.find().sort({ createdAt: -1 });
        const usersWithCounts = await Promise.all(users.map(async (user) => {
            const orderCount = await Order.countDocuments({ userId: user._id });
            return {
                ...user.toObject(),
                orderCount
            };
        }));
        res.json(usersWithCounts);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch users" });
    }
}

export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        await Usermodel.findByIdAndDelete(id);
        res.status(200).json({ message: "User deleted" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to delete user" });
    }
}

export const logout = async (req, res) => {
    try {
        const { cart } = req.body;
        const user = await Usermodel.findOne({ email: req.user.email });
        if (user) {
            user.status = "Logout";
            if (cart) user.cart = cart;
            await user.save();
        }
        res.status(200).json({ message: "Logout successful" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Logout failed" });
    }
}

export const saveCart = async (req, res) => {
    try {
        const { cart } = req.body;
        const user = await Usermodel.findOne({ email: req.user.email });
        if (user) {
            user.cart = cart;
            await user.save();
            res.status(200).json({ message: "Cart saved" });
        } else {
            res.status(404).json({ error: "User not found" });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to save cart" });
    }
}
