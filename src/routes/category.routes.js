const {
    createCategorieHandel,
    deleteCategorieHandel,
    getCategorieByIdHandler,
    getUserCategoriesHandel,
    updateCategorieHandel, getCategorySummaryHandler,

} = require("../presenters/categorie.presenter");
const authenticate = require("../middleware/authenticate");


async function categoryRoutes(fastify, options) {
    fastify.addHook("preHandler", authenticate);

    fastify.post("/createCategories", createCategorieHandel);
    fastify.put("/updateCategory/:id", updateCategorieHandel);
    fastify.delete("/deleteCategory/:id", deleteCategorieHandel);
    fastify.get("/listeCategories", getUserCategoriesHandel);
    fastify.get("/OneCategory/:id", getCategorieByIdHandler);
    fastify.get("/summary",getCategorySummaryHandler)
}

module.exports = categoryRoutes;
