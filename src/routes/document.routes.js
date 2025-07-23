const {
    createDocumentHandler,
    deleteDocumentHandle,
    deleteDocumentsByCategoryHandler,
    getDocumentsByCategoryHandler,
    getUserDocumentHandle,
    updateDocumentHandle,
    getDocmentByIdHandler, deleteMultipleDocumentsHandler, searchDocumentHandle
} = require("../presenters/document.presenter");

const authenticate = require("../middleware/authenticate");

async function documentRoutes(fastify, options) {

    fastify.post("/createDocument", {
        preValidation: [authenticate]},
        createDocumentHandler
    );

    fastify.get("/getAllDocuments", {
        preValidation: [authenticate],
        handler: getUserDocumentHandle
    });

    fastify.get("/getDocuments/:id", {
        preValidation: [authenticate],
        handler: getDocmentByIdHandler
    });

    fastify.delete("/deleteDocuments/:id", {
        preValidation: [authenticate],
        handler: deleteDocumentHandle
    });

    fastify.put("/updateDocuments/:id", {
        preValidation: [authenticate],
        handler: updateDocumentHandle
    });

    fastify.get("/categories/:categoryId/documents", {
        preValidation: [authenticate],
        handler: getDocumentsByCategoryHandler
    });

    fastify.delete("/categories/:categoryId/documents", {
        preValidation: [authenticate],
        handler: deleteDocumentsByCategoryHandler
    });

    fastify.delete("/deleteMultipleDocuments", {
        preValidation: [authenticate],
        handler: deleteMultipleDocumentsHandler
    });

    fastify.get("/searchDocuments", {
        preValidation: [authenticate],
        handler: searchDocumentHandle
    });

}

module.exports = documentRoutes;
