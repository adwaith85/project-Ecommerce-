import Product from "../model/productmodel.js"
import Category from "../model/cateModel.js"

export const item = async (req, res) => {
    const { search, category: categoryId } = req.query;
    console.log("Search term:", search);
    console.log("Category ID:", categoryId);

    try {
        let query = {};

        if (search && search.trim() !== "") {
            // Escape special characters to prevent regex breaking
            const escapedSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const searchRegex = new RegExp(escapedSearch, 'i');

            // Find categories that match the search term
            const matchedCategories = await Category.find({
                name: searchRegex
            }).select('_id');

            const matchedCategoryIds = matchedCategories.map(cat => cat._id);

            // Search in product name OR category ID list
            query.$or = [
                { name: searchRegex },
                { category: { $in: matchedCategoryIds } }
            ];
        }

        if (categoryId && categoryId !== "null" && categoryId !== "") {
            query.category = categoryId;
        }

        let products = await Product.find(query).populate("category").exec();
        res.json(products);
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ message: "Server Error" });
    }
}

export const itemadd = async (req, res) => {
    try {
        const { name, image, price, category } = req.body
        await Product.create({ name, image, price, category })
        res.status(201).send("ok created")
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: "Failed to create product" })
    }
}

export const deleteitem = async (req, res) => {
    try {
        const { id } = req.params
        await Product.findByIdAndDelete(id)
        res.status(200).json({ message: "Product deleted" })
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: "Failed to delete" })
    }
}

export const updateitem = async (req, res) => {
    try {
        const { id } = req.params
        const { name, image, price, category } = req.body
        const updated = await Product.findByIdAndUpdate(id, { name, image, price, category }, { new: true })
        res.status(200).json(updated)
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: "Update failed" })
    }
}
