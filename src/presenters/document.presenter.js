const path = require("path");
const fs = require("fs/promises");
const {createDocument, getUserDocuments, deleteDocument, getDocumetnsByCategory, deleteDocumentsByCategory,
    updateDocument,getDocumentById, deleteMultipleDocument, deleteManyByIds, searchDocument
} = require("../repositories/document.repository");

const UPLOAD_DIR = path.join(__dirname, "..", "uploads");

const createDocumentHandler = async (request, reply) => {
    try {
        const userId = request.user.id;

        const data = await request.file();

        if (!data) {
            return reply.code(400).send({ message: "Aucun fichier reçu" });
        }

        const fields = data.fields;
        const filename = `${Date.now()}_${data.filename}`;
        const filepath = path.join(UPLOAD_DIR, filename);

        await fs.mkdir(UPLOAD_DIR, { recursive: true });
        await fs.writeFile(filepath, await data.toBuffer());

        let parsedTags = [];
        try {
            parsedTags = fields.tags?.value ? JSON.parse(fields.tags.value) : [];
        } catch (e) {
            console.warn("⚠️ Erreur parsing tags. Valeur ignorée.");
        }

        // Création + indexation du document
        const createdDoc = await createDocument({
            title: fields.title?.value || data.filename,
            description: fields.description?.value || "",
            type: fields.type?.value || data.mimetype,
            fileUrl: `uploads/${filename}`,
            categoryId: fields.categoryId?.value || null,
            userId,
            tags: parsedTags,
        });

        reply.code(201).send(createdDoc);
    } catch (err) {
        console.error("❌ Erreur dans createDocumentHandler :", err);
        reply.code(500).send({ message: "Erreur lors de la création du document." });
    }
};


const getUserDocumentHandle = async (request,reply)=>{
    const userId = request.user.id;
    const docs = await getUserDocuments(userId);
    reply.send(docs);
}

const deleteDocumentHandle = async(request,reply)=>{
    const {id} = request.params;
    const userId = request.user.id;

    const doc =await deleteDocument(id,userId);

    if (!doc) return reply.code(404).send({ message: "Document non trouvé" });

    try{
        await fs.unlink(path.join(__dirname, "..", doc.fileUrl));
    }catch (e){
        console.warn("Fichier déjà supprimé ou introuvable.");
    }
    reply.send({ message: "Document supprimé" });
}
const updateDocumentHandle = async (request, reply) => {
    const userId = request.user.id;
    const { id } = request.params;
    const body = request.body || {};

    // Construction dynamique de l'objet de mise à jour
    const updateData = {};

    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.categoryId !== undefined) updateData.categoryId = body.categoryId;
    if (body.tags !== undefined) {
        try {
            updateData.tags = JSON.parse(body.tags);
        } catch {
            updateData.tags = [];
        }
    }

    const updated = await updateDocument(id, userId, updateData);
    if (!updated) return reply.code(404).send({ message: "Document non trouvé" });

    reply.send(updated);
};


const getDocumentsByCategoryHandler = async (request, reply) => {
    const userId = request.user.id;
    const { categoryId } = request.params;
    const docs = await getDocumetnsByCategory(categoryId, userId);
    reply.send(docs);
};

const getDocmentByIdHandler = async(request,reply)=>{
    const { id } = request.params;
    try{
        const doc= await getDocumentById(id)

        if(!doc)
            return reply.code(404).send({message:"Document non trouve"})
        reply.send(doc)
    }catch (e){
        reply.code(400).send({message: "ID invalide ou erreur serveur"})
    }
}
const deleteDocumentsByCategoryHandler = async (request, reply) => {
    const userId = request.user.id;
    const { categoryId } = request.params;
    const docs = await getDocumetnsByCategory(categoryId, userId);

    for (const doc of docs) {
        try {
            await fs.unlink(path.join(__dirname, "..", doc.fileUrl));
        } catch {}
    }

    await deleteDocumentsByCategory(categoryId, userId);
    reply.send({ message: "Documents supprimés avec succès" });
};

const deleteMultipleDocumentsHandler = async (request,reply)=>{
    const userId = request.user.id;
    const {ids}=request.body;

    const docs = await deleteMultipleDocument(ids,userId);

    for(const doc of docs){
        if(doc.fileUrl){
            try {
                await fs.unlink(path.join(__dirname, "..", doc.fileUrl));
            } catch (e) {
                console.warn(`Erreur suppression fichier ${doc.fileUrl} :`, e.message);
            }
        }
    }
    await deleteManyByIds(ids, userId);

    reply.send({ message: "Documents supprimés avec succès", count: docs.length });
}

const searchDocumentHandle = async (req, reply) => {
    try {
        const connectedUserId = req.user?.id;

        // on autorise une surcharge par ?userId= dans l’URL
        const targetUserId = req.query.userId || connectedUserId;
        console.log("targetUserId",targetUserId)

        if (!targetUserId) {
            return reply.code(400).send({ error: "User ID manquant." });
        }

        const { title, tags, categoryId } = req.query;

        const result = await searchDocument({
            userId: targetUserId,
            title,
            tags: tags ? (Array.isArray(tags) ? tags : [tags]) : [],
            categoryId
        });

        reply.send(result);
    } catch (e) {
        console.error("Erreur dans searchDocumentHandle:", e);
        reply.code(500).send({ error: e.message });
    }
};


module.exports={
    createDocumentHandler,
    deleteDocumentsByCategoryHandler,
    deleteDocumentHandle,
    getDocumentsByCategoryHandler,
    getUserDocumentHandle,
    updateDocumentHandle,
    getDocmentByIdHandler,
    deleteMultipleDocumentsHandler,
    searchDocumentHandle
}
