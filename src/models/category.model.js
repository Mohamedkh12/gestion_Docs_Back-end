const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema(
    {
        nomCat: {
            type: String,
            required: true,
            trim: true,
        },
        description:
            {
                type: String
            },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    { timestamps: true }
);

const Category = mongoose.model("Category", CategorySchema);

module.exports = Category;
