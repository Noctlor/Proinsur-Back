const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const cloudinary = require('cloudinary').v2;


cloudinary.config({
  cloud_name: 'dujj3kz6x',
  api_key: '711327931848858',
  api_secret: '2m7NNzoTWz0im-xxLMaprBKbiu8'
});

router.get('/', async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'An error occurred', error: error.message });
  }
});

// Ruta para agregar un nuevo producto
router.post('/add', async (req, res) => {
  try {
    const { name, description, price, stock , image} = req.body;

    let imageUrl = "";
    if (image) {
      const result = await cloudinary.uploader.upload(image, { folder: 'products' });
      imageUrl = result.secure_url;
    }
    const newProduct = new Product({
      name,
      description,
      price,
      stock,
      image: imageUrl
    });
    await newProduct.save();

    res.status(201).json({ message: 'Product added successfully' });
  } catch (error) {
    res.status(500).json({ message: 'An error occurred', error: error.message });
  }
});

// Ruta para eliminar un producto por su ID
router.delete('/:productId', async (req, res) => {
  try {
    const productId = req.params.productId;

    // Buscar y eliminar el producto por su ID
    const deletedProduct = await Product.findByIdAndDelete(productId);
    if (!deletedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'An error occurred', error: error.message });
  }
});

// Ruta para actualizar un producto por su ID
// Ruta para actualizar un producto por su ID
router.put('/:productId', async (req, res) => {
  try {
    const productId = req.params.productId;
    const { name, description, price, stock, image } = req.body;

    // Obtener el producto existente por su ID
    const existingProduct = await Product.findById(productId);
    if (!existingProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Si se proporciona una nueva imagen, subirla a Cloudinary y obtener la URL
    let imageUrl = existingProduct.image;
    if (image) {
      const result = await cloudinary.uploader.upload(image, { folder: 'products' });
      imageUrl = result.secure_url;
    }

    // Actualizar los campos del producto, incluyendo la imagen actualizada si se proporciona
    existingProduct.name = name;
    existingProduct.description = description;
    existingProduct.price = price;
    existingProduct.stock = stock;
    existingProduct.image = imageUrl;

    // Guardar los cambios en el documento del producto
    await existingProduct.save();

    res.status(200).json({ message: 'Product updated successfully', product: existingProduct });
  } catch (error) {
    res.status(500).json({ message: 'An error occurred', error: error.message });
  }
});


module.exports = router;
