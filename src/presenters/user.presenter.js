const User = require("../models/user.model");
const {findUserByEmail} = require("../repositories/user.repository");
const dns = require('dns').promises;

// -------------------- UTILS --------------------
const verifyEmailDomain = async (email) => {
    const domain = email.split("@")[1];
    if (!domain) throw new Error('Email invalide');

    try {
        const records = await dns.resolveMx(domain);
        if (!records || records.length === 0) {
            throw new Error("Domaine email invalide ou inexistant");
        }
    } catch (error) {
        throw new Error("Domaine email invalide ou inexistant");
    }
};



const createUser = async (userData) => {
    const user = new User(userData);
    const result = await user.save();
    return result;
};

// -------------------- PRESENTERS --------------------
const handleRegister = async (req, reply) => {
    try {
        const { password, confirmPassword, email } = req.body;

        if (password !== confirmPassword) {
            throw new Error("Les mots de passe ne correspondent pas");
        }

        await verifyEmailDomain(email);
        const userExists = await findUserByEmail(email);
        if (userExists) throw new Error("Email déjà utilisé");

        await createUser(req.body);
        reply.code(201).send({ message: "Utilisateur créé" });
    } catch (error) {
        reply.code(400).send({ error: error.message });
    }
};

const handleLogin = async (req, reply) => {
    try {
        const { email, password } = req.body;
        const user = await findUserByEmail(email);

        if (!user || !(await user.isValidPassword(password))) {
            throw new Error("Identifiants invalides");
        }

        // Enregistrer l'utilisateur dans la session
        req.session.user = {
            id: user._id,
            firstname: user.firstname,
            lastname: user.lastname,
            email: user.email,
        };
        reply.send({
            user: {
                firstname: user.firstname,
                lastname: user.lastname,
                email: user.email,
            },
            message: "Connexion réussie.",
        });
    } catch (error) {
        reply.code(401).send({ error: error.message });
    }
};

const getUserHandle = async (req, reply) => {
    try {
        const user = req.user;
        if (!user) throw new Error("Utilisateur non authentifié");

        reply.send({
            firstname: user.firstname,
            lastname: user.lastname,
            email: user.email,
        });
    } catch (e) {
        reply.code(401).send({ error: e.message });
    }
};

async function logoutUser(request, reply) {
    if (request.session && request.session.user) {
        request.session.destroy((err) => {
            if (err) {
                reply.code(500).send({ error: "Erreur lors de la déconnexion" });
            } else {
                reply.send({ message: "Déconnexion réussie" });
            }
        });
    } else {
        reply.code(400).send({ error: "Aucun utilisateur connecté" });
    }
}



module.exports = {
    handleRegister,
    handleLogin,
    getUserHandle,
    logoutUser,
};
