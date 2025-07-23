const {createTagHandle, updateTagsHandle, deleteTagsHandle, getUserTagsHandle, getTagsByIdHandle, searchTagHandle} = require("../presenters/tag.presenter");
const authenticate = require("../middleware/authenticate");
async function tagRoutes (fastify,option){
    fastify.addHook("preHandler", authenticate);

    fastify.post("/createTags",createTagHandle)
    fastify.get("/getAllTags",getUserTagsHandle)
    fastify.get("/getTag/:id",getTagsByIdHandle)
    fastify.put("/updateTag/:id",updateTagsHandle)
    fastify.delete("/deleteTag/:id",deleteTagsHandle)
    fastify.get("/searchTag",searchTagHandle)
}

module.exports = tagRoutes
