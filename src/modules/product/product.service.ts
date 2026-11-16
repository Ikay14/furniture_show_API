import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Product } from './model/product.model';
import { Model } from 'mongoose';
import { Category } from '../admin/model/category.model';
import { FilterListDto, ProductSortBy } from './DTO/product-query.dto';
import { RoomBundleDto } from './DTO/room-bundle.dto';

@Injectable()
export class ProductService {
    constructor(
        @InjectModel(Product.name) private productModel: Model<Product>,
        @InjectModel(Category.name) private categoryModel: Model<Category>
    ) {}

    async getAllProducts(page: number, limit: number, filterBy: FilterListDto = {}) {

            const filter: any = {}

            if(filterBy.name) {
                filter['name'] = { $regex: filterBy.name, $options: 'i' }
            }

            if (filterBy.minPrice || filterBy.maxPrice) {
                filter['price'] = {}
                if (filterBy.minPrice) filter['price'].$gte = filterBy.minPrice;
                if (filterBy.maxPrice) filter['price'].$lte = filterBy.maxPrice;
            }

            // Category filter
            if (filterBy.category) {
              filter['category'] = filterBy.category
            }

            
            const products = await this.productModel
                .find(filter)
                .skip((page - 1) * limit)
                .limit(limit)
                .populate('category')
                .lean()
    
            // if no products found, throw an error
                if( filter || !products.length) throw new BadRequestException('No products found');
    
            // return the products
            return {
                products,
                 pagination: {
                    page,
                    limit,
                    total: await this.productModel.countDocuments(filter),
                },
            }
}

        async getAProduct(productId: string):Promise<{msg: string, product: Product}>{
            const product = await this.productModel.findById(productId)
            .populate('category', 'name')
    
            if(!product || product.inStock === 0) throw new NotFoundException('Product Found')
    
            return {
                msg: 'Product returned successfully',
                product
            }    
        }

    async getProductByCategory(categoryId: string, page: number, limit: number): Promise<{ msg: string; products: Product[], total: number; limit: number; page: number }> {

        const [products, total ] = await Promise.all([ 
        this.productModel.find({ category: categoryId })
        .populate('category', 'name')
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 }),

         this.productModel.countDocuments({ category: categoryId })
        ])
        if(!products || products.length === 0) throw new NotFoundException('No products found for this category')

        return {
            msg: 'Products found successfully',
            products,
            total,
            limit,
            page
        }
    }

    async getCategories(): Promise<{ msg: string; categories: Category[] }> {

    // Fetch distinct category IDs from products
    const categoryIds = await this.productModel.find().distinct('category');

    if (!categoryIds.length) throw new NotFoundException('No categories found');

    // Fetch categories based on the distinct IDs
    const categories = await this.categoryModel.find({ _id: { $in: categoryIds } });

    return {
        msg: 'Categories fetched successfully',
        categories,
  };
}

    async fitMySpaceSearch(
        page: number = 1,
        limit: number = 10,
        filterBy: FilterListDto = {},
    ) {
        const query = this.buildSpatialFilter(filterBy);
        const sort = this.buildSortOption(filterBy.sortBy);

        const candidates = await this.productModel
            .find(query)
            .sort(sort)
            .populate('category', 'name')
            .lean();

        const cleared = filterBy.doorwayWidth
            ? candidates.filter((p) =>
                this.fitsThroughDoorway(p.dimensions, filterBy.doorwayWidth!),
              )
            : candidates;

        const total = cleared.length;
        const start = (page - 1) * limit;
        const products = cleared.slice(start, start + limit);

        return {
            msg: 'Spatial search completed',
            products,
            pagination: { page, limit, total },
        };
    }

    async generateRoomBundle(dto: RoomBundleDto) {
        const roomArea = dto.roomDimensions.width * dto.roomDimensions.depth;
        const maxWalkableFootprintCm2 = Math.round(roomArea * 0.65);
        const maxResults = dto.maxResults ?? 3;

        const candidates = await this.productModel
            .find({
                isDeleted: { $ne: true },
                status: 'active',
                inStock: { $gt: 0 },
                price: { $lte: dto.budget },
                $or: [
                    { 'dimensions.height': { $exists: false } },
                    { 'dimensions.height': { $lte: dto.roomDimensions.height } },
                ],
            })
            .populate('category', 'name')
            .lean();

        const eligible = candidates.filter((p) => {
            if (dto.doorwayWidth && !this.fitsThroughDoorway(p.dimensions, dto.doorwayWidth)) {
                return false;
            }
            if (p.dimensions) {
                const fitsRoomOrientation =
                    (p.dimensions.width <= dto.roomDimensions.width &&
                        p.dimensions.depth <= dto.roomDimensions.depth) ||
                    (p.dimensions.depth <= dto.roomDimensions.width &&
                        p.dimensions.width <= dto.roomDimensions.depth);
                if (!fitsRoomOrientation) return false;
            }
            return true;
        });

        const scored = eligible
            .map((product) => ({
                product,
                score: this.scoreBundleCandidate(product, dto),
                footprint: this.computeFootprint(product.dimensions),
            }))
            .sort((a, b) => b.score - a.score);

        const bundles: Array<{
            items: any[];
            totalPrice: number;
            remainingBudget: number;
            footprintCm2: number;
            footprintUtilizationPercent: number;
            styleMatchScore: number;
        }> = [];

        for (let offset = 0; offset < scored.length && bundles.length < maxResults; offset++) {
            const picked: typeof scored = [];
            const usedCategories = new Set<string>();
            let runningPrice = 0;
            let runningFootprint = 0;

            for (let i = offset; i < scored.length; i++) {
                const candidate = scored[i];
                const catKey = String(
                    (candidate.product.category as any)?._id ??
                        candidate.product.category ??
                        candidate.product._id,
                );
                if (usedCategories.has(catKey)) continue;
                if (runningPrice + candidate.product.price > dto.budget) continue;
                if (runningFootprint + candidate.footprint > maxWalkableFootprintCm2) continue;

                picked.push(candidate);
                usedCategories.add(catKey);
                runningPrice += candidate.product.price;
                runningFootprint += candidate.footprint;
            }

            if (picked.length > 0) {
                const avgScore =
                    picked.reduce((sum, item) => sum + item.score, 0) / picked.length;
                bundles.push({
                    items: picked.map((p) => p.product),
                    totalPrice: runningPrice,
                    remainingBudget: Number((dto.budget - runningPrice).toFixed(2)),
                    footprintCm2: runningFootprint,
                    footprintUtilizationPercent: Number(
                        ((runningFootprint / roomArea) * 100).toFixed(1),
                    ),
                    styleMatchScore: Number(avgScore.toFixed(2)),
                });
            }
        }

        return {
            msg: 'Room bundles generated successfully',
            roomType: dto.roomType,
            budget: dto.budget,
            maxWalkableFootprintCm2,
            bundles,
        };
    }

    private buildSpatialFilter(filterBy: FilterListDto): Record<string, any> {
        const query: Record<string, any> = {
            isDeleted: { $ne: true },
            status: 'active',
        };

        if (filterBy.name) {
            query.name = { $regex: filterBy.name, $options: 'i' };
        }
        if (filterBy.minPrice !== undefined || filterBy.maxPrice !== undefined) {
            query.price = {};
            if (filterBy.minPrice !== undefined) query.price.$gte = Number(filterBy.minPrice);
            if (filterBy.maxPrice !== undefined) query.price.$lte = Number(filterBy.maxPrice);
        }
        if (filterBy.category) {
            query.category = filterBy.category;
        }
        if (filterBy.maxWidth !== undefined) {
            query['dimensions.width'] = { $lte: Number(filterBy.maxWidth) };
        }
        if (filterBy.maxHeight !== undefined) {
            query['dimensions.height'] = { $lte: Number(filterBy.maxHeight) };
        }
        if (filterBy.maxDepth !== undefined) {
            query['dimensions.depth'] = { $lte: Number(filterBy.maxDepth) };
        }
        if (filterBy.material) {
            query.material = { $regex: filterBy.material, $options: 'i' };
        }
        if (filterBy.color) {
            query.colorOptions = { $elemMatch: { $regex: filterBy.color, $options: 'i' } };
        }
        if (filterBy.tags?.length) {
            query.tags = { $in: filterBy.tags };
        }
        return query;
    }

    private buildSortOption(sortBy?: ProductSortBy): Record<string, 1 | -1> {
        switch (sortBy) {
            case ProductSortBy.PRICE_ASC:
                return { price: 1 };
            case ProductSortBy.PRICE_DESC:
                return { price: -1 };
            case ProductSortBy.RATING:
                return { averageRating: -1, numReviews: -1 };
            default:
                return { createdAt: -1 };
        }
    }

    private fitsThroughDoorway(
        dimensions: { width?: number; height?: number; depth?: number } | undefined,
        doorwayWidth: number,
    ): boolean {
        if (!dimensions) return true;
        const axes = [dimensions.width, dimensions.height, dimensions.depth].filter(
            (v): v is number => typeof v === 'number' && v > 0,
        );
        if (axes.length < 2) return true;
        const sorted = [...axes].sort((a, b) => a - b);
        return sorted[0] <= doorwayWidth && sorted[1] <= doorwayWidth;
    }

    private computeFootprint(
        dimensions?: { width?: number; depth?: number },
    ): number {
        if (!dimensions?.width || !dimensions?.depth) return 0;
        return dimensions.width * dimensions.depth;
    }

    private scoreBundleCandidate(product: any, dto: RoomBundleDto): number {
        let score = (product.averageRating || 3) * 10;

        if (dto.preferredMaterials?.length && product.material) {
            const mat = product.material.toLowerCase();
            if (dto.preferredMaterials.some((m) => mat.includes(m.toLowerCase()))) {
                score += 25;
            }
        }

        if (dto.preferredColors?.length && Array.isArray(product.colorOptions)) {
            const colors = product.colorOptions.map((c: string) => c.toLowerCase());
            if (
                dto.preferredColors.some((pref) =>
                    colors.some((c: string) => c.includes(pref.toLowerCase())),
                )
            ) {
                score += 20;
            }
        }

        if (Array.isArray(product.tags)) {
            const roomToken = dto.roomType.replace('_', ' ').toLowerCase();
            if (
                product.tags.some((t: string) =>
                    t.toLowerCase().includes(roomToken) ||
                    t.toLowerCase().includes(dto.roomType.toLowerCase()),
                )
            ) {
                score += 15;
            }
        }

        return score;
    }

}