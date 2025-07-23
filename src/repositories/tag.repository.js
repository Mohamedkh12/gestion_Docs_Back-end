const Tag = require("../models/tag.model");
const mongoose = require("mongoose");
const esClient = require("../config/elasticsearch");

const createTage = async (userId, { name, color = '#3b82f6', description = "" }) => {
    // Vérification d'unicité
    const existing = await findTagByName(userId, name);
    if (existing) {
        const error = new Error("Ce tag existe déjà");
        error.code = 11000;
        throw error;
    }

    const tag = await Tag.create({
        name: name.toLowerCase().trim(),
        color,
        description: description.trim(),
        userId
    });

    await esClient.index({
        index: "tags",
        id: tag._id.toString(),
        document: {
            name: tag.name,
            color: tag.color,
            description: tag.description,
            userId: userId.toString(),
        },
        refresh: true
    });

    return tag;
};

const findTagByName = async (userId, name) => {
    const trimmedName = name.toLowerCase().trim();
    return await Tag.findOne({ name: trimmedName, userId });
};

const getUserTags = async (userId) => {
    return await Tag.find({ userId }).sort({ name: 1 });
};

const getTagById = async (id, userId) => {
    return await Tag.findOne({ _id: id, userId });
};

const deleteTag = async (id, userId) => {
    await mongoose.model("Document").updateMany(
        { tags: id, userId },
        { $pull: { tags: id } }
    );

    const deleted = await Tag.findOneAndDelete({ _id: id, userId });

    if (deleted) {
        await esClient.delete({
            index: "tags",
            id: deleted._id.toString(),
            refresh: true
        });
    }

    return deleted;
};
const findOrCreateTags = async (userId, tagNames, defaultColor = '#3b82f6') => {
    const tags = [];

    for (const name of tagNames) {
        const trimmedName = name.trim().toLowerCase();
        if (!trimmedName) continue;

        let tag = await Tag.findOne({ name: trimmedName, userId });
        if (!tag) {
            tag = await createTage(userId, {
                name: trimmedName,
                color: defaultColor
            });
        }

        tags.push(tag._id);
    }

    return tags;
};

const updateTag = async (id, userId, { name, color, description }) => {
    // Si on veut changer le nom, on vérifie que ce nouveau nom n'existe pas déjà
    if (name) {
        const existing = await findTagByName(userId, name);
        if (existing && existing._id.toString() !== id.toString()) {
            const error = new Error("Ce nom de tag existe déjà");
            error.code = 11000;
            throw error;
        }
    }

    const updateData = {};
    if (name) updateData.name = name.toLowerCase().trim();
    if (color) updateData.color = color;
    if (description !== undefined) updateData.description = description.trim();

    const tag = await Tag.findOneAndUpdate(
        { _id: id, userId },
        updateData,
        { new: true, runValidators: true }
    );

    if (tag) {
        await esClient.index({
            index: "tags",
            id: tag._id.toString(),
            document: {
                name: tag.name,
                color: tag.color,
                description: tag.description,
                userId: tag.userId.toString()
            },
            refresh: true
        });
    }

    return tag;
};
const searchTagsElastic = async (query, userId) => {
    const finalQuery = query.trim().toLowerCase();

    const { hits } = await esClient.search({
        index: "tags",
        size: 20,
        query: {
            bool: {
                must: [
                    {
                        wildcard: {
                            name: {
                                value: `*${finalQuery}*`
                            }
                        }
                    },
                    {
                        term: {
                            userId: userId.toString()
                        }
                    }
                ]
            }
        }
    });

    return hits.hits.map(hit => ({
        _id: hit._id,
        name: hit._source.name,
        color: hit._source.color,
        description: hit._source.description || ""
    }));
};


module.exports = {
    createTage,
    getUserTags,
    getTagById,
    deleteTag,
    findOrCreateTags,
    updateTag,
    searchTagsElastic
};
