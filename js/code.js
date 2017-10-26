$(document).ready(function () {

	//passe a true durant l'animation du volet, pour empecher les animations multiples
	volet_info_cosmo = false;

	//définition du mode de fonctionnement du formulaire d'ajout,
	//servant aussi à la modification d'une fiche
	type_formulaire_ajout = "ajout";

	//passe a true durant l'actualisation ou la recherche de cosmonaute, empechant les requetes multiples
	actualisation_cosmo = false;

	//dimensions constantes, évite l'appel jquery à chaque consultation
	dim_zoneprincipale_width = $("#zone_principale").width();
	dim_zoneprincipale_height = $("#zone_principale").height();
	marge_zoneprincipale = 5;
	dim_cosmo_width = 0; // dimension définies lors de l'initialisation
	dim_cosmo_height = 0;

	/* ----------------------------------------------------------------------- */
	/* --------- BLOC DU MENU : Actualisation, Ajout fiche, Recherche -------- */
	/* ----------------------------------------------------------------------- */

	//Actualisation
	$("#picto_actualisation").click(function () { //au clic sur l'icone actualiser
		if (!actualisation_cosmo) {
			actualisation_cosmo = true;
			actualise_cosmo("");
		}
		reinit_formulaire_ajout();
		$("#bloc_compte").removeClass("visible");
	});

	//Ajout fiche / Compte
	$("#picto_compte").click(function () { //au clic sur l'icone d'ajout
		$("#bloc_compte").toggleClass("visible");
		reinit_formulaire_ajout();
	});
	
	//fiche / Compte : envoi du formulaire d'ajout / modification
	//(aussi bien utilisé lors d'un ajout que d'une modification de fiche)
	$("form#ajouter").submit(function() {
		if (type_formulaire_ajout == "modif")//si formulaire de modification
			var param = "?edition"; //ajout d'un paramètre dans l'url de traitement
		else
			var param = "";

		//récupérations des données dans le formulaire
		var id = $("#ajouter #id").val();
		var nom = $("#ajouter #nom").val();
		var prenom = $("#ajouter #prenom").val();
		var groupe = $("#ajouter #groupe").val();
		var url_photo = $("#ajouter #url_photo").val();
		var url_portfolio = $("#ajouter #url_portfolio").val();
		var mdp = $("#ajouter #mdp").val();
		var mdpc = $("#ajouter #mdpc").val();
		var motscles = $("#ajouter #keyword").val();

		$("form#ajouter .erreur").html(""); //reinit du message d'erreur
		
		//vérifications des données avant envoi
		if (nom == "" || nom == null) {
			$("form#ajouter .erreur").html("Votre nom est incorrect");
			return false;
		}
		if (prenom == "" || prenom == null) {
			$("form#ajouter .erreur").html("Votre prénom est incorrect");
			return false;
		}
		if (groupe == "" || groupe == null) {
			$("form#ajouter .erreur").html("Votre spécialité est incorrecte");
			return false;
		}
		if (url_photo == "" || url_photo == null) {
			$("form#ajouter .erreur").html("L'url de l'avatar est incorrecte");
			return false;
		}
		if (url_portfolio == "" || url_portfolio == null) {
			$("form#ajouter .erreur").html("L'url du portfolio est incorrecte");
			return false;
		}
		if (motscles == "" || motscles == null) {
			$("form#ajouter .erreur").html("Veuillez saisir un mot-clé");
			return false;
		}
		if (mdp == "" || mdp == null) {
			$("form#ajouter .erreur").html("Veuillez saisir votre mot de passe");
			return false;
		}

		//vérifications sur les mots de passe
		if (type_formulaire_ajout == "modif") {//pour formulaire de modification
			if (mdpc != "" || mdpc != null) {
				//s'il y a une confirmation entrée et donc modification sur le mot de passe 

				if (mdp != mdpc) {//mots de passe différents
					$("form#ajouter .erreur").html("Les mots de passe ne sont pas identiques");
					return false;
				}
			}
		} else { //pour formulaire en mode ajout
			if (mdpc == "" || mdpc == null) {
				$("form#ajouter .erreur").html("Confirmation de mot de passe incorrecte");
				return false;
			}
			if (mdp != mdpc) {//mots de passe différents
				$("form#ajouter .erreur").html("Les mots de passe ne sont pas identiques");
				return false;
			}
		}

		//envoi par requete ajax des infos
		$.ajax({
			type: "POST",
			url: "ajout.php"+param,
			data: {
				id: id,
				nom: nom,
				prenom: prenom,
				groupe: groupe,
				url_photo: url_photo,
				url_portfolio: url_portfolio,
				mdp: mdp,
				mdpc: mdpc,
				motscles: motscles
			}
		}).done(function( reponse ) {
			if (reponse == 1) { // confirmation de l'inscription / modification
				//personnalisation du message de confirmation
				if (type_formulaire_ajout == "modif") //modification
					var conf = "Modifications effectuées. Actualiser pour visualiser";
				else //message par défaut
					var conf = "Ajout confirmé !<br />Votre profil est en attente de validation";

				$("form#ajouter").fadeOut(500, function() {//disparition du formulaire
					//affichage de la confirmation
					$("#confirmation_ajout").html(conf).fadeIn(1000);
					$("form#ajouter .erreur").html("");//reset du message d'erreur
				});
			} else { //affichage de l'erreur
				$("form#ajouter .erreur").html(reponse);
			}
		});
		return false;
	});

	//Recherche
	$("#picto_recherche").click(function () { //au clic sur l'icone recherche
		$("#form_search").toggleClass("visible");//affichage de la barre de recherche
	});
		//envoi recherche
	$("#form_search").submit(function() {
		if (!actualisation_cosmo) {
			actualisation_cosmo = true;
			//envoi par requete ajax de la recherche + actualisation des cosmos
			actualise_cosmo($("#form_search #champ_recherche").val());
		}
		return false;
	});

	function actualise_cosmo(recherche) {
		$("#zone_principale").css({"opacity":0});
		setTimeout(function() {
			$("#zone_principale").html(""); //on supprime tous les cosmonautes
			charge_resultats(recherche, ""); //on recupere de nouveaux resultats
		}, 1000);
	}

	/* ----------------------------------------------------------------------- */
	/* --------------- POPUP INFO - Liens A propos et Crédits --------------- */
	/* ----------------------------------------------------------------------- */

	//clic sur les liens en bas de page : ouverture popup
	$("#piedpage .popup").click(function() {
		ouvre_popup($(this).attr("href"));
	});
	$("#close_popup, #fond_popup").click(function() {
		ferme_popup();
	});

	function ouvre_popup(id_contenu_a_afficher) {
		$("#fond_popup").show();
		$("#popup").show();
		$(".contenu_popup").hide();//masque le contenu precedent
		$(id_contenu_a_afficher).show();//affiche le contenu désiré
		setTimeout(function() { //animation avec un délai
			$("#fond_popup").addClass("visible");
			$("#popup").addClass("visible");
		}, 200);
	}

	function ferme_popup() { //animation de fermeture de la popup
		$("#fond_popup").removeClass("visible");
		$("#popup").removeClass("visible");
		setTimeout(function() {
			$("#fond_popup").hide();
			$("#popup").hide();
		}, 350);
	}

	/* ----------------------------------------------------------------------- */
	/* ----------------- GESTION ET ANIMATION DES COSMONAUTES ---------------- */
	/* ----------------------------------------------------------------------- */

	//INITIALISATION - au chargement du site : récupération de 10 cosmonautes aléatoire
	charge_resultats("", ""); //pas de paramètres car récupération par défaut

	function charge_resultats(recherche, nombre) {
		//récupération des fiches en ajax, pas de recherche ni nombre par défaut
		$.ajax({
			type: "GET",
			url: "resultats.php",
			data: {motscles: recherche, nb_res: nombre}
		}).done(function( resultats ) {
			if (resultats == 0) { //si aucun élément n'est retourné lors de la recherche
				var erreur = "Aucun résultat. Essayez un autre terme ou actualisez.";
				$("#zone_principale").html('<div class="no_r">'+erreur+'</div>')
				$("#zone_principale").css({"opacity":1});
				actualisation_cosmo = false;
				return false;
			}

			//parsing des resultats texte en json
			resultats = $.parseJSON(resultats);

			//generation des blocs html : 1 resultat = 1 cosmonaute
			for (var i = 0; i < resultats.length; i++) {
				//insertion du code html avec les infos récupérées
				$("#zone_principale").append('<div class="cosmo '+resultats[i]["groupe"]+'" target="cosmo_'+resultats[i]["id"]+'"><div class="reflet"></div><div class="photo"><img src="'+resultats[i]["url_photo"]+'"></div></div><div class="info_cosmo" style="background-image:url('+resultats[i]["url_photo"]+');" id="cosmo_'+resultats[i]["id"]+'"><form method="post" class="form_modif"><div class="bloc_modif"><input type="hidden" class="modif_id" value="'+resultats[i]["id"]+'"><div class="label_modif">Saisir mot de passe pour modifier les données</div><input type="password" class="modif_mdp"><input type="submit" value="OK"><div class="erreur"></div></div></form><div class="groupe '+resultats[i]["groupe"]+'"></div><div class="close"></div><a class="icon_modif"></a><div class="contenu_info"><div class="nom">'+resultats[i]["prenom"]+' <span>'+resultats[i]["nom"]+'</span></div><div class="url_portfolio"><a target="_blank" href="'+resultats[i]["url_portfolio"]+'" title="Voir son portfolio">Voir son<br />portfolio</a></div></div></div>');
			};

			//définition des dimensions
			dim_cosmo_width = $("#zone_principale .cosmo").width();
			dim_cosmo_height = $("#zone_principale .cosmo").height();

			//lancement des animations
			initialisation_cosmo();
		});
	}

	function initialisation_cosmo() {
		$("#zone_principale .cosmo").each(function() { //pour chaque cosmo
			var objet = $(this);
			calcul_destination(objet); //positionne le cosmo aleatoirement au démarrage
			objet.css({"opacity":1}); //apparition du cosmo en fondu

			setTimeout(function() { //lancement du premier déplacement apres 3 secondes
				deplace_cosmo(objet);
			}, 3000);
		});

		//si on est dans l'actualisation ou la recherche, on reaffiche la zone principale
		if (actualisation_cosmo) {
			actualisation_cosmo = false;
			$("#zone_principale").css({"opacity":1});
		}

		//lancement des écouteurs d'évènements pour les cosmonautes générés
		$(".cosmo").click(function () { //au clic sur un cosmo
			if (!volet_info_cosmo) {
				volet_info_cosmo = true;
				ouvre_volet_info($(this), 0);
			} else {//si le volet info était déjà ouvert
				ouvre_volet_info($(this), 300);
			}
		});
		$(".info_cosmo .close").click(function () { //fermeture volet
			ferme_volet_info(true);
		});
		$(".info_cosmo .icon_modif").click(function() { //modification
			//affichage formulaire de vérification du mot de passe
			$(this).parent().children(".form_modif").toggle();
		});
		//envoi du formulaire de vérification de mot de passe
		$(".info_cosmo .form_modif").submit(function() {
			traitement_modification($(this));
			return false;
		});
	}

	function deplace_cosmo(obj_jquery) {
		var temps_deplacement = aleatoire(15, 30); //temps de deplacement aléatoire en s
		var angle_rotation = aleatoire(-120, 120); //angle de rotation aléatoire
		calcul_destination(obj_jquery);// definition des nouvelles coordonnees cible
		obj_jquery.css({
			"transition-duration":temps_deplacement+"s",
			"transform":"rotate("+angle_rotation+"deg)"
		});

		setTimeout(function() { //declenchement d'un nouveau deplacement apres x secondes
			deplace_cosmo(obj_jquery);
		}, temps_deplacement*1000); //conversion du tmps de déplacement (s) en ms
	}

	function calcul_destination(obj_jquery) {
		//recuperation de valeurs aléatoires
		var gen_x = aleatoire(marge_zoneprincipale, dim_zoneprincipale_width-marge_zoneprincipale);
		var gen_y = aleatoire(marge_zoneprincipale, dim_zoneprincipale_height-marge_zoneprincipale);
		//vérification du décalage
		if (gen_x > dim_cosmo_height) gen_x -= dim_cosmo_height; //la hauteur est plus grande que la largeur
		if (gen_y > dim_cosmo_height) gen_y -= dim_cosmo_height;
		//application des nouvelles dimensions à l'element
		obj_jquery.css({"left":gen_x, "top": gen_y});
	}

	function traitement_modification(form_jquery) {
		//envoi par requete ajax des infos
		//verification de la véracité du mot de passe saisi
		$.ajax({
			type: "POST",
			url: "verif.php",
			data: {
				id: form_jquery.find(".modif_id").val(),
				mdp: form_jquery.find(".modif_mdp").val()
			}
		}).done(function( reponse ) {
			if (reponse == 0) { // mauvais mot de passe
				form_jquery.find(".erreur").html("Mot de passe incorrect");
				form_jquery.find(".modif_mdp").val("");
			} else { //mot de passe OK : l'ajax renvoi les infos de l'utilisateur en json

				//on ferme la fiche de l'utilisateur, et reinitialise le formulaire de mot de passe
				form_jquery.find(".erreur").html("");//reset du message d'erreur
				form_jquery.hide();//ferme formulaire verif du mot de passe
				ferme_volet_info(true);//ferme la fiche du cosmo

				//formattage des données en json
				data = $.parseJSON(reponse);

				//remplissage du formulaire
				$("#ajouter #id").val(data[0]["id"]);
				$("#ajouter #nom").val(data[0]["nom"]);
				$("#ajouter #prenom").val(data[0]["prenom"]);
				$("#ajouter #groupe option:selected").removeAttr('selected');
				$("#ajouter #groupe option[value='"+data[0]["groupe"]+"']").attr("selected", "selected");
				$("#ajouter #url_photo").val(data[0]["url_photo"]);
				$("#ajouter #url_portfolio").val(data[0]["url_portfolio"]);
				$("#ajouter #keyword").val(data[0]["motscles"]);

				//mise à jour du formulaire
				$("#ajouter #btn_envoi").attr("value", "Modifier"); //changement du label
				type_formulaire_ajout = "modif"; //passage du formulaire en mode modification
				$("#bloc_compte").addClass("visible"); // affichage du formulaire avec les infos pré-remplies
			}
		});
		return false;
	}

	function reinit_formulaire_ajout() { // remise à 0 du formulaire, pour ajouter un nouveau membre
		$("#ajouter #btn_envoi").attr("value", "Décoller !");//label du bouton par défaut
		type_formulaire_ajout = "ajout";
		$("form#ajouter .erreur, #confirmation_ajout").html(""); // efface l'erreur et la confirmation
		$("form#ajouter").show().get(0).reset(); // vide les infos du formulaire et affiche le form
	}

	/* ----------------------------------------------------------------------- */
	/* ----- OUVERTURE DU VOLET D'INFORMATIONS AU CLIC SUR UN COSMONAUTE ----- */
	/* ----------------------------------------------------------------------- */

	function ouvre_volet_info(obj_jquery, delai) {
		var cible_info = obj_jquery.attr("target");//recuperation de l'ID du cosmo cliqué
		if (delai != 0)// on ferme le volet précédent avant d'ouvrir le nouveau
			ferme_volet_info(false);

		$("#"+cible_info).delay(delai).addClass("visible");
	}

	function ferme_volet_info(action) {
		if (action) //s'il n'y a pas de nouveau volet appelé
			volet_info_cosmo = false;

		$(".info_cosmo, #info_sat").removeClass("visible");
		$(".info_cosmo .form_modif").hide();
	}

	/* ----------------------------------------------------------------------- */
	/* ------- ANIMATIONS / FONCTIONNALITES du Satellite et de PATOCHE ------- */
	/* ----------------------------------------------------------------------- */

	//Satellite Paris 8

	$("#satellite").click(function () { //au clic sur le satellite
		if (!volet_info_cosmo) {
			volet_info_cosmo = true;
			ouvre_volet_info($(this), 0);
		} else {//si l'info était déjà ouverte
			ouvre_volet_info($(this), 300);
		}
	});
	$("#info_sat .close").click(function () { //fermeture volet du satellite
		ferme_volet_info(true);
	});

	//Patoche
	//lancement de l'animation au chargement
	anim_patoche();

	function anim_patoche() {
		setTimeout(function() { //lancement toutes les 42 secondes
			var horizontal = parseInt($("#patoche").css("left"));
			if (horizontal > 0) //patoche a droite
				horizontal = (parseInt($("#patoche").width()) * -1 ) - 20; //direction vers gauche
			else
				horizontal = dim_zoneprincipale_width + 20;
			horizontal = horizontal + "px";

			var vertical = aleatoire(0, dim_zoneprincipale_height); //vertical aleatoire
			vertical = vertical + "px";

			$("#patoche").css({"top":vertical, "left":horizontal});//application de l'animation css

			anim_patoche(); //relance de l'animation en boucle ttes les 42sec
		}, 42000);
	}
});

//récupéré sur internet...
function aleatoire(n, m) {
	return (Math.floor(Math.random()*(m-n+1)+n));
}