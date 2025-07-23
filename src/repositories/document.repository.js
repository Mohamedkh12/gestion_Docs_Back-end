const Document = require("../models/document.model");
const esClient = require("../config/elasticsearch");

const createDocument = async (data) => {
    const doc = new Document(data);
    await doc.save();

    // Chargement complet pour indexation
    const populated = await Document.findById(doc._id)
        .populate("tags", "name color")
        .populate("categoryId", "nomCat");

    // Indexation manuelle dans Elasticsearch
    await esClient.index({
        index: "documents",
        id: populated._id.toString(),
        body: {
            title: populated.title,
            description: populated.description || "",
            tags: populated.tags.map(t => ({ _id: t._id.toString(), name: t.name })),
            userId: populated.userId.toString(),
            categoryId: populated.categoryId?._id?.toString() || null,
            createdAt: populated.createdAt,
            updatedAt: populated.updatedAt
        }
    });

    return populated;
};


const getUserDocuments = async (userId) => {
    return await Document.find({ userId })
        .populate("categoryId", "nomCat")
        .populate("tags", "name color")
        .sort({ createdAt: -1 });
};

const getDocumentById = async (id) => {
    return await Document.findById(id)
        .populate("categoryId", "nomCat")
        .populate("tags", "name color");
};

const deleteDocument = async (id, userId) => {
    const doc = await Document.findOneAndDelete({ _id: id, userId });

    if (doc) {
        try {
            await esClient.delete({
                index: "documents",
                id: doc._id.toString()
            });
        } catch (e) {
            console.warn("⚠️ Erreur suppression Elasticsearch (peut être déjà supprimé) :", e.meta?.body?.error?.reason || e.message);
        }
    }

    return doc;
};


const getDocumentsByCategory = async (categoryId, userId) => {
    return await Document.find({ categoryId, userId });
};

const deleteDocumentsByCategory = async (categoryId, userId) => {
    return await Document.deleteMany({ categoryId, userId });
};

const updateDocument = async (id, userId, updateData) => {
    const updated = await Document.findOneAndUpdate(
        { _id: id, userId },
        updateData,
        { new: true, runValidators: true }
    )
        .populate("categoryId", "nomCat")
        .populate("tags", "name color");

    if (updated) {
        await esClient.index({
            index: "documents",
            id: updated._id.toString(),
            body: {
                title: updated.title,
                description: updated.description || "",
                tags: updated.tags.map(t => ({ _id: t._id.toString(), name: t.name })),
                userId: updated.userId.toString(),
                categoryId: updated.categoryId?._id?.toString() || null,
                createdAt: updated.createdAt,
                updatedAt: updated.updatedAt
            }
        });
    }

    return updated;
};

const deleteMultipleDocument = async (ids, userId) => {
    return await Document.find({ _id: { $in: ids }, userId });
};

const deleteManyByIds = async (ids, userId) => {
    return await Document.deleteMany({ _id: { $in: ids }, userId });
};

const searchDocument = async ({ title, tags, categoryId, userId }) => {
    const must = [
        {
            match: { userId }
        }
    ];

    if (title) {
        must.push({
            match_phrase_prefix: {
                title: {
                    query: title
                }
            }
        });
    }

    if (tags && tags.length > 0) {
        must.push({
            nested: {
                path: "tags",
                query: {
                    bool: {
                        should: tags.map(tagId => ({
                            match: { "tags._id": tagId }
                        })),
                        minimum_should_match: 1
                    }
                }
            }
        });
    }

    if (categoryId) {
        must.push({
            match: {
                categoryId
            }
        });
    }

    const result = await esClient.search({
        index: "documents",
        size: 50,
        body: {
            query: {
                bool: {
                    must
                }
            }
        }
    });

    const ids = result.hits.hits.map(hit => hit._id);

    const fullDocs = await Document.find({ _id: { $in: ids } })
        .populate("categoryId", "nomCat")
        .populate("tags", "name color")
        .sort({ createdAt: -1 });

    return fullDocs;
};

module.exports = {
    createDocument,
    getUserDocuments,
    getDocumentById,
    deleteDocument,
    getDocumentsByCategory,
    deleteDocumentsByCategory,
    updateDocument,
    deleteMultipleDocument,
    deleteManyByIds,
    searchDocument
};
