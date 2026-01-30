import Product, { IProduct } from "../models/product.model";

export class ProductRepository {
    async createProduct(data: Partial<IProduct>): Promise<IProduct> {
        return await Product.create(data);
    }

    async getAllProducts(): Promise<IProduct[]> {
        return await Product.find().sort({ createdAt: -1 });
    }

    async getProductById(id: string): Promise<IProduct | null> {
        return await Product.findById(id);
    }

    async updateProduct(id: string, data: Partial<IProduct>): Promise<IProduct | null> {
        return await Product.findByIdAndUpdate(id, data, { new: true });
    }

    async deleteProduct(id: string): Promise<IProduct | null> {
        return await Product.findByIdAndDelete(id);
    }
}
