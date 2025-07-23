const mongoose = require("mongoose");
const dotenv = require("dotenv");
const { Client } = require("@elastic/elasticsearch");
const Document = require("../src/models/document.model");
const Tag = require("../src/models/tag.model");

dotenv.config({ path: "src/config/.env" });

const esClient = new Client({ node: "http://localhost:9200" });
const indexName = "documents";

async function recreateDocumentsIndex() {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connecté à MongoDB");

    const exists = await esClient.indices.exists({ index: indexName });
    if (exists) {
        await esClient.indices.delete({ index: indexName });
        console.log("🗑️ Ancien index 'documents' supprimé");
    }

    await esClient.indices.create({
        index: indexName,
        body: {
            settings: {
                analysis: {
                    tokenizer: {
                        edge_ngram_tokenizer: {
                            type: "edge_ngram",
                            min_gram: 1,
                            max_gram: 20,
                            token_chars: ["letter", "digit"]
                        }
                    },
                    analyzer: {
                        edge_ngram_analyzer: {
                            type: "custom",
                            tokenizer: "edge_ngram_tokenizer",
                            filter: ["lowercase"]
                        }
                    }
                }
            },
            mappings: {
                properties: {
                    title: {
                        type: "text",
                        analyzer: "edge_ngram_analyzer",
                        search_analyzer: "standard"
                    },
                    description: { type: "text" },
                    tags: {
                        type: "nested",
                        properties: {
                            _id: { type: "keyword" },
                            name: { type: "text" },
                        }
                    },
                    userId: { type: "keyword" },
                    categoryId: { type: "keyword" },
                    createdAt: { type: "date" },
                    updatedAt: { type: "date" }
                }
            }
        }
    });

    console.log("✅ Index 'documents' recréé avec mapping");

    // Indexer tous les documents existants
    const documents = await Document.find()
        .populate("tags", "_id name")
        .lean();

    if (documents.length === 0) {
        console.log("⚠️ Aucun document à indexer.");
    }

    const bulkBody = documents.flatMap(doc => [
        { index: { _index: indexName, _id: doc._id.toString() } },
        {
            title: doc.title,
            description: doc.description || "",
            tags: doc.tags.map(t => ({ _id: t._id.toString(), name: t.name })),
            userId: doc.userId.toString(),
            categoryId: doc.categoryId ? doc.categoryId.toString() : null,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt
        }
    ]);

    const result = await esClient.bulk({ refresh: true, body: bulkBody });

    if (result.errors) {
        console.error("❌ Erreurs lors de l’indexation !");
        result.items.forEach(item => {
            if (item.index && item.index.error) {
                console.error(`ID: ${item.index._id}`);
                console.error(item.index.error);
            }
        });
    } else {
        console.log(`✅ ${documents.length} documents indexés avec succès.`);
    }

    process.exit(0);
}

recreateDocumentsIndex().catch(err => {
    console.error("❌ Erreur:", err);
    process.exit(1);
});
