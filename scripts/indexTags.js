const mongoose = require("mongoose");
const dotenv = require("dotenv");
const { Client } = require("@elastic/elasticsearch");
const Tag = require("../src/models/tag.model");

dotenv.config({ path: "src/config/.env" });

const esClient = new Client({ node: "http://localhost:9200" });
const indexName = "tags";

async function recreateTagsIndex() {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connecté à MongoDB");

    const exists = await esClient.indices.exists({ index: indexName });
    if (exists) {
        await esClient.indices.delete({ index: indexName });
        console.log("🗑️ Ancien index 'tags' supprimé");
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
                    name: {
                        type: "text",
                        analyzer: "edge_ngram_analyzer",
                        search_analyzer: "standard"
                    },
                    color: { type: "keyword" },
                    userId: { type: "keyword" } // ✅ nécessaire pour les filtres term
                }
            }
        }
    });

    console.log("✅ Index 'tags' recréé avec edge_ngram");

    const tags = await Tag.find().lean();

    const bulkBody = tags.flatMap(tag => [
        { index: { _index: indexName, _id: tag._id.toString() } },
        {
            name: tag.name,
            color: tag.color,
            userId: tag.userId?.toString() || null
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
        console.log(`✅ ${tags.length} tags indexés avec succès.`);
    }

    process.exit(0);
}

recreateTagsIndex().catch(err => {
    console.error("❌ Erreur:", err);
    process.exit(1);
});
