const mongoose = require("mongoose")

const tagSchema =new mongoose.Schema({
    name: {
        type : String,
        required: true,
        trim:true,
        lowercase: true,
        maxlength: 50
    },
        description: {
            type: String,
            trim: true,
            maxlength: 255,
            default: ""
        },
        color: {
            type: String,
            default: "#cccccc",
            match: /^#([0-9A-Fa-f]{6})$/,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
},{timestamps:true}
)

tagSchema.index({ name: 1, userId: 1 }, { unique: true });

const Tag = mongoose.model("Tag",tagSchema)
module.exports = Tag
