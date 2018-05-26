const router = require('express').Router();
const User = require('../models/User');
const Session = require('../models/Session');
const bcrypt = require('bcrypt');


// GET / => Affiche un formulaire user/pass
router.get('/sessions', function (request, response) {


    response.render('sessions/login.ejs')

});

// POST / => Génère un accessToken et l'enregistre dans la table `sessions`: en HTML on set un cookie `accessToken`, en JSON, on
// retourne simplement `{accessToken: XXXX}`
router.post('/sessions', function (request, response, next) {

    // récup mail /mdp
    // chercher le mec par l'email et vérifier le mdp
    // si tout est bon, choper son id et le passer à la cr"ation de session

    if (!checkEmptyFields(request.body)) {

            let email = request.body.email;
            let plainPassword = request.body.password;

        User.findByEmail(email, function (rowUser) {

            if (rowUser !== undefined) {
                if(bcrypt.compareSync(plainPassword, rowUser.password)){

                    Session.create(rowUser.rowid, () => {

                        Session.find(rowUser.rowid, (rowSession) => {

                            let accessToken = rowSession.accessToken;
                            request.session.user = rowUser;

                            response.format({
                                html: () => {

                                    response.cookie('accessToken', accessToken, { maxAge: 1000*60*60 });
                                    response.redirect('/users')
                                },
                                json: () => {
                                    response.send(accessToken);
                                }
                            });


                        }, next);

                    }, next);

                } else {
                    // invalid password
                    response.redirect('/sessions')
                }
            } else {
                // invalid email
                response.redirect('/sessions')
            }
        }, next);
    } else {
        // champs pas remplis
        response.redirect('/sessions')
    }

});

// DELETE / => Supprime un accessToken
router.delete('/sessions', function (request, response, next) {

    let accessToken = request.cookies['accessToken'];

    Session.delete(accessToken, () => {

        request.session.destroy();
        response.clearCookie('accessToken');
        response.end();

    }, next);

});


function checkEmptyFields(fields) {
    for (let field in fields) {
        if (!fields[field]) {
            return true;
        }
    }
    return false;
}


module.exports = router;