const Product = require('../models/Product');

// Tạo sản phẩm mới
exports.createProduct = async (req, res) => {
  try {
 
    if (Array.isArray(req.body.colors) && req.body.colors.length > 0) {
      req.body.colors = req.body.colors.map(c => ({
        ...c,
        quantity: c.quantity !== undefined ? Number(c.quantity) : (typeof req.body.quantity === 'number' ? req.body.quantity : 0),
        discount: c.discount !== undefined ? Number(c.discount) : 0,
        status: typeof c.status === 'string' ? c.status : 'Available',
        rating: c.rating !== undefined ? Number(c.rating) : 0
      }));
      // Không lưu product.quantity tổng nếu có màu
      delete req.body.quantity;
    }
    
    const product = new Product(req.body);
    await product.save();
    res.status(201).json({ status: 'OK', message: 'Tạo sản phẩm thành công', data: product });
  } catch (error) {
    res.status(500).json({ status: 'ERR', message: error.message });
  }
};

// Lấy danh sách sản phẩm
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json({ status: 'OK', data: products });
  } catch (error) {
    res.status(500).json({ status: 'ERR', message: error.message });
  }
};

// Lấy chi tiết sản phẩm
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ status: 'ERR', message: 'Không tìm thấy sản phẩm' });
    res.status(200).json({ status: 'OK', data: product });
  } catch (error) {
    res.status(500).json({ status: 'ERR', message: error.message });
  }
};

// Cập nhật sản phẩm
exports.updateProduct = async (req, res) => {
  try {
    // Nếu cập nhật colors, chuẩn hóa lại các trường cho từng màu
    if (Array.isArray(req.body.colors) && req.body.colors.length > 0) {
      req.body.colors = req.body.colors.map(c => ({
        ...c,
        quantity: c.quantity !== undefined ? Number(c.quantity) : 0,
        discount: c.discount !== undefined ? Number(c.discount) : 0,
        status: typeof c.status === 'string' ? c.status : 'Available',
        rating: c.rating !== undefined ? Number(c.rating) : 0
      }));
      // Không cập nhật product.quantity tổng nếu có màu
      delete req.body.quantity;
    }
    // Hàm chuẩn hóa mô tả sản phẩm
    function normalizeDescription(desc) {
        const fieldMap = [
            { regex: /^0:/, name: 'Chất liệu vỏ' },
            { regex: /^1:/, name: 'Kích thước vỏ' },
            { regex: /^2:/, name: 'Cấu trúc' },
            { regex: /^3:/, name: 'Trọng lượng' },
            { regex: /^4:/, name: 'Dây đeo' },
            // Thêm các trường khác nếu cần
        ];
        if (typeof desc !== 'string') return desc;
        let lines = desc.split(/\n|\r|<br\s*\/?>/).map(line => line.trim()).filter(line => line);
        let newLines = lines.map(line => {
            for (const field of fieldMap) {
                if (field.regex.test(line)) {
                    const value = line.split(':').slice(1).join(':').trim();
                    return `${field.name}: ${value}`;
                }
            }
            return line;
        });
        return newLines.join('\n');
    }
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!product) return res.status(404).json({ status: 'ERR', message: 'Không tìm thấy sản phẩm' });
        if (req.body.description) {
            product.description = normalizeDescription(req.body.description);
        }
        // Chuẩn hóa cho từng màu nếu có
        if (Array.isArray(req.body.colors)) {
            req.body.colors.forEach((colorObj, idx) => {
                if (colorObj.description) {
                    product.colors[idx].description = normalizeDescription(colorObj.description);
                }
            });
        }
        res.status(200).json({ status: 'OK', message: 'Cập nhật thành công', data: product });
  } catch (error) {
    res.status(500).json({ status: 'ERR', message: error.message });
  }
};

// Xóa sản phẩm
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ status: 'ERR', message: 'Không tìm thấy sản phẩm' });
    res.status(200).json({ status: 'OK', message: 'Đã xóa sản phẩm' });
  } catch (error) {
    res.status(500).json({ status: 'ERR', message: error.message });
  }
};

// API cập nhật trạng thái cho từng màu sản phẩm
exports.updateColorStatus = async (req, res) => {
  try {
    const { productId, color, status } = req.body;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ status: 'ERR', message: 'Không tìm thấy sản phẩm' });
    const colorObj = product.colors.find(c => c.color === color);
    if (!colorObj) return res.status(404).json({ status: 'ERR', message: 'Không tìm thấy màu sản phẩm' });
    colorObj.status = status;
    await product.save();
    res.status(200).json({ status: 'OK', message: 'Cập nhật trạng thái thành công', data: product });
  } catch (error) {
    res.status(500).json({ status: 'ERR', message: error.message });
  }
};
