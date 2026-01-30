import { Request, Response } from "express";
import { ProductRepository } from "../repositories/product.repository";

export class ProductController {
    private productRepository: ProductRepository;

    constructor() {
        this.productRepository = new ProductRepository();
    }

    async createProduct(req: Request, res: Response) {
        try {
            const { name, description, price, category, stock } = req.body;
            let image = "";
            if (req.file) {
                image = `/uploads/${req.file.filename}`;
            }

            const product = await this.productRepository.createProduct({
                name,
                description,
                price: Number(price),
                category,
                stock: Number(stock),
                image,
            });

            res.status(201).json({ success: true, data: product });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async getAllProducts(req: Request, res: Response) {
        try {
            const products = await this.productRepository.getAllProducts();
            res.status(200).json({ success: true, data: products });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async getProductById(req: Request, res: Response) {
        try {
            const product = await this.productRepository.getProductById(req.params.id);
            if (!product) {
                return res.status(404).json({ success: false, message: "Product not found" });
            }
            res.status(200).json({ success: true, data: product });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async updateProduct(req: Request, res: Response) {
        try {
            const { name, description, price, category, stock } = req.body;
            const updateData: any = {
                name, description, price: Number(price), category, stock: Number(stock)
            };

            if (req.file) {
                updateData.image = `/uploads/${req.file.filename}`;
            }

            const product = await this.productRepository.updateProduct(req.params.id, updateData);
            if (!product) {
                return res.status(404).json({ success: false, message: "Product not found" });
            }
            res.status(200).json({ success: true, data: product });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async deleteProduct(req: Request, res: Response) {
        try {
            const product = await this.productRepository.deleteProduct(req.params.id);
            if (!product) {
                return res.status(404).json({ success: false, message: "Product not found" });
            }
            res.status(200).json({ success: true, message: "Product deleted successfully" });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
}
