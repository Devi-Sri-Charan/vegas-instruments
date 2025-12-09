const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

// initialize admin if none exists
async function ensureAdmin() {
  const count = await Admin.countDocuments();
  if (count === 0) {
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(ADMIN_PASSWORD || 'admin123', salt);
    await Admin.create({ email: ADMIN_EMAIL || 'admin@vega.com', password: hashed });
    console.log('Initial admin created:', ADMIN_EMAIL || 'admin@vega.com');
  }
}

// login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const payload = { id: admin._id, email: admin.email };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '12h' });

    return res.json({ token });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.registerIfNot = async (req, res) => {
  try {
    await ensureAdmin();
    res.json({ message: 'Admin ensured' });
  } catch (err) {
    res.status(500).json({ message: 'Error ensuring admin' });
  }
};
