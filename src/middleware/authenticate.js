module.exports = async function authenticate(req, reply) {
    if (!req.session || !req.session.user) {
        return reply.code(401).send({ message: "Non autorisé - session invalide" });
    }

    req.user = req.session.user;


};
