const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema({
    title:
        { type: String,
        required: true,
        es_indexed: true
        },
    fileUrl:
        { type: String,
        required: true
        },
    description:
        {
            type: String
        },
    type:
        {
            type: String,
            required: true
        },
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    tags: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Tag",
            es_indexed: true
        }
    ]
}, { timestamps: true });


const Document = mongoose.model("Document", documentSchema);

module.exports = Document;
