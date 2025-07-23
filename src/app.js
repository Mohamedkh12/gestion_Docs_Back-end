const fastify = require('fastify')({ logger: true });
const path = require("path");
const dotenv = require("dotenv");
const fastifyMultipart = require("@fastify/multipart");
const fastifyStatic = require("@fastify/static");
const fastifyCookie = require('@fastify/cookie');
const fastifySession = require('@fastify/session');
const fastifyCORS = require('@fastify/cors');
const connectDB = require('./config/db');

dotenv.config({ path: 'src/config/.env' });
connectDB();

// Enregistrer les cookies AVANT la session
fastify.register(fastifyCookie);

fastify.register(fastifySession, {
    secret: process.env.SESSION_SECRET || 'un-secret-tres-long-et-securise-pour-session',
    cookie: {
        secure: false,
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000,
    },
    saveUninitialized: false
});


//Puis seulement enregistrer CORS
fastify.register(fastifyCORS, {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
});

// Autres middlewares
fastify.register(require("@fastify/multipart"), {
    limits: {
        fileSize: 50 * 1024 * 1024 // 50 Mo
    }
});
fastify.register(fastifyStatic, {
    root: path.join(__dirname, "uploads"),
    prefix: "/uploads/",
});
fastify.register(require('@fastify/formbody'));

// Routes
fastify.register(require("./routes/user.routes"), { prefix: "/api/users" });
fastify.register(require("./routes/category.routes"), { prefix: "/api/category" });
fastify.register(require("./routes/document.routes"), { prefix: "/api/document" });
fastify.register(require("./routes/tag.routes"), { prefix: "/api/tag" });
fastify.register(require("./routes/invitation.route"), { prefix: "/api/invitations" });
fastify.register(require("./routes/permission.routes"), { prefix: "/api/permission" });
fastify.register(require("./routes/role.routes"), { prefix: "/api/role" });
fastify.register(require('./routes/workspace.routes'), { prefix: '/api/workspaces' });

// Lancement
const start = async () => {
    try {
        await fastify.listen({ port: parseInt(process.env.PORT) });
        fastify.log.info(`✅ Serveur lancé sur le port ${process.env.PORT}`);
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start();
