const Category = require("../models/category.model");
const Document = require("../models/document.model");
const mongoose = require("mongoose");

const CategoryExiste = async ({ nomCat, userId, excludeId = null }) => {
    const query = { nomCat, userId };
    if (excludeId) {
        query._id = { $ne: excludeId };
    }

    const exist = await Category.findOne(query);

    if (exist) {
        const error = new Error("Cette catégorie existe déjà");
        error.code = "CATEGORY_EXISTS";
        throw error;
    }
};

const createCategory = async ({ nomCat, description, userId }) => {
    await CategoryExiste({ nomCat, userId });
    const cat = new Category({ nomCat: nomCat.trim(), description: description?.trim(), userId });
    return await cat.save();
};

const getCategoriesByUser = async (userId) => {
    return await Category.find({ userId });
};

const getCategoriesById = async (id) => {
    return await Category.findById(id);
};

const updateCategories = async (id, nomCat, description, userId) => {
    await CategoryExiste({ nomCat, userId, excludeId: id });
    const updated = await Category.findOneAndUpdate(
        { _id: id, userId },
        { nomCat: nomCat.trim(), description: description?.trim() },
        { new: true, runValidators: true }
    );
    return updated;
};

const deleteCategories = async (id, userId) => {
    return await Category.findOneAndDelete({ _id: id, userId });
};

const getCategoryDocumentSummary = async (userId) => {
    const summary = await Document.aggregate([
        {
            $match: {
                userId: new mongoose.Types.ObjectId(userId),
                categoryId: { $ne: null }
            }
        },
        {
            $group: {
                _id: "$categoryId",
                count: { $sum: 1 }
            }
        },
        {
            $match: {
                _id: { $ne: null }
            }
        },
        {
            $lookup: {
                from: "categories",
                localField: "_id",
                foreignField: "_id",
                as: "category"
            }
        },
        {
            $unwind: {
                path: "$category",
            }
        },
        {
            $project: {
                _id: "$_id",
                name: "$category.nomCat",
                count: 1
            }
        },
        {
            $sort: { name: 1 }
        }
    ]);

    return summary;
};

module.exports = {
    createCategory,
    deleteCategories,
    updateCategories,
    getCategoriesById,
    getCategoriesByUser,
    getCategoryDocumentSummary
};
