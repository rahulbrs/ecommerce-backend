const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const adminRoutes = require('./routes/admin');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads')); // Serve uploaded images

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/admin', adminRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));