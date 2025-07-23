const {
    createTage,
    getUserTags,
    getTagById,
    updateTag,
    deleteTag,
    searchTagsElastic
} = require("../repositories/tag.repository");

const createTagHandle = async (request, reply) => {
    try {
        const userId = request.user.id;
        const { name, color, description } = request.body;

        const tag = await createTage(userId, { name, color, description });
        reply.code(201).send(tag);
    } catch (error) {
        if (error.code === 11000) {
            // Erreur doublon nom tag
            reply.code(409).send({ message: "Ce tag existe déjà" });
        } else {
            throw error;
        }
    }
};

const getUserTagsHandle = async (request, reply) => {
    const userId = request.user.id;
    const tags = await getUserTags(userId);
    reply.send(tags);
};

const getTagsByIdHandle = async (request, reply) => {
    const { id } = request.params;
    const userId = request.user.id;

    const tag = await getTagById(id, userId);
    if (!tag)
        return reply.code(404).send({ message: "Tag non trouvé" });

    reply.send(tag);
};

const updateTagsHandle = async (request, reply) => {
    try {
        const tag = await updateTag(
            request.params.id,
            request.user.id,
            request.body
        );

        if (!tag)
            return reply.code(404).send({ message: "Tag non trouvé" });

        reply.send(tag);
    } catch (error) {
        if (error.code === 11000) {
            // Erreur doublon nom tag à la mise à jour
            reply.code(409).send({ message: "Ce nom de tag existe déjà" });
        } else {
            throw error;
        }
    }
};

const deleteTagsHandle = async (request, reply) => {
    const userId = request.user.id;
    const { id } = request.params;

    const deletedTag = await deleteTag(id, userId);

    if (!deletedTag)
        return reply.code(404).send({ message: "Tag non trouvé" });

    reply.send({ message: "Tag supprimé avec succès" });
};

const searchTagHandle = async (request, reply) => {
    const { q } = request.query;
    const userId = request.user.id;

    try {
        const tags = await searchTagsElastic(q || "", userId);
        reply.send(tags);
    } catch (err) {
        console.error("Erreur recherche de tags :", err);
        reply.status(500).send({ message: "Erreur de recherche tags" });
    }
};

module.exports = {
    createTagHandle,
    getUserTagsHandle,
    getTagsByIdHandle,
    updateTagsHandle,
    deleteTagsHandle,
    searchTagHandle,
};
