const {
    createCategory,
    getCategoriesByUser,
    updateCategories,
    deleteCategories,
    getCategoriesById,
    getCategoryDocumentSummary
} = require("../repositories/category.repository");

const createCategorieHandel = async (request, reply) => {
    try {
        const { nomCat, description } = request.body;
        const userId = request.user.id;

        if (!nomCat)
            throw new Error("Le nom de la catégorie est requis");

        const newCat = await createCategory({ nomCat, description, userId });
        reply.code(201).send(newCat);
    } catch (error) {
        if (error.code === "CATEGORY_EXISTS") {
            return reply.code(409).send({ error: error.message });
        }
        reply.code(400).send({ error: error.message });
    }
};

const getUserCategoriesHandel = async (request, reply) => {
    try {
        const userId = request.user.id;
        const categories = await getCategoriesByUser(userId);
        reply.send(categories);
    } catch (error) {
        reply.code(500).send({ error: error.message });
    }
};

const updateCategorieHandel = async (request, reply) => {
    try {
        const { id } = request.params;
        const { nomCat, description } = request.body;
        const userId = request.user.id;

        const update = await updateCategories(id, nomCat, description, userId);

        if (!update)
            return reply.code(404).send({ message: 'Catégorie non trouvée ou accès refusé' });

        reply.send(update);
    } catch (error) {
        if (error.code === "CATEGORY_EXISTS") {
            return reply.code(409).send({ error: error.message });
        }
        reply.code(400).send({ error: error.message });
    }
};

const deleteCategorieHandel = async (request, reply) => {
    try {
        const { id } = request.params;
        const userId = request.user.id;

        const deletedCat = await deleteCategories(id, userId);

        if (!deletedCat)
            return reply.code(404).send({ message: 'Catégorie non trouvée' });

        reply.send({ message: 'Catégorie supprimée' });
    } catch (error) {
        reply.code(404).send({ error: error.message });
    }
};

const getCategorieByIdHandler = async (request, reply) => {
    try {
        const { id } = request.params;
        const userId = request.user.id;

        const category = await getCategoriesById(id);

        if (!category || category.userId.toString() !== userId.toString()) {
            return reply.code(404).send({ message: "Catégorie non trouvée ou accès refusé" });
        }

        reply.send(category);
    } catch (error) {
        reply.code(404).send({ error: error.message });
    }
};

const getCategorySummaryHandler = async (request, reply) => {
    try {
        const userId = request.user.id;
        const summary = await getCategoryDocumentSummary(userId);
        reply.send(summary);
    } catch (e) {
        reply.code(500).send({ error: e.message });
    }
};

module.exports = {
    createCategorieHandel,
    getUserCategoriesHandel,
    updateCategorieHandel,
    deleteCategorieHandel,
    getCategorieByIdHandler,
    getCategorySummaryHandler
};
