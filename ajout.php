<?php

require_once("config.php");
session_start();

try
{
    // On se connecte à MySQL
    $bdd = new PDO('mysql:host='.HOTE.';dbname='.BASE.'', LOGIN, PASS);
}
catch(Exception $e)
{
    // En cas d'erreur, on affiche un message et on arrête tout
	die('Erreur : '.$e->getMessage());
}
$bdd->exec("SET CHARACTER SET utf8");

$edition = isset($_GET["edition"]) ? true : false;

$id = !empty($_POST["id"]) ? htmlspecialchars($_POST["id"]) : "";

$donnees = array(
	"nom" => !empty($_POST["nom"]) ? htmlspecialchars($_POST["nom"]) : "",
	"prenom" => !empty($_POST["prenom"]) ? htmlspecialchars($_POST["prenom"]) : "",
	"groupe" => !empty($_POST["groupe"]) ? htmlspecialchars($_POST["groupe"]) : "",
	"url_photo" => !empty($_POST["url_photo"]) ? htmlspecialchars($_POST["url_photo"]) : "",
	"url_portfolio" => !empty($_POST["url_portfolio"]) ? htmlspecialchars($_POST["url_portfolio"]) : "",
	"mdp" => !empty($_POST["mdp"]) ? htmlspecialchars($_POST["mdp"]) : "",
	"mdpc" => !empty($_POST["mdpc"]) ? htmlspecialchars($_POST["mdpc"]) : "",
	"motscles" => !empty($_POST["motscles"]) ? htmlspecialchars($_POST["motscles"]) : ""
);
$label_donnees  = array(
	"nom" => "nom",
	"prenom" => "prénom",
	"groupe" => "groupe",
	"url_photo" => "photo",
	"url_portfolio" => "lien portfolio",
	"mdp" => "mot de passe",
	"mdpc" => "confirmation du mot de passe",
	"motscles" => "mots clés"
);

$mdp_clair = !empty($donnees["mdp"]) ? $donnees["mdp"] : "";
$donnees["mdp"] = md5($donnees["mdp"]);

if($edition) {
	$modif_mdp = "";

	if ($donnees["mdpc"] == "") { // pas de modif sur le mot de passe
		$reponse = $bdd->prepare("SELECT * FROM `".TABLE_ESPACECEN."` WHERE id='".$id."' AND mdp='".$donnees["mdp"]."'");
		$reponse->execute();
		if ($reponse->rowCount() != 1) {
			echo "Mot de passe incorrect";
			exit();
		}
	} else {
		if ($donnees["mdp"] == md5($donnees["mdpc"]))
			$modif_mdp = "mdp = :mdp,";
		else {
			echo "Mots de passe différents";
			exit();
		}
	}

	$resultat = $bdd->prepare("UPDATE ".TABLE_ESPACECEN." SET
		nom = :nom,
		prenom = :prenom,
		groupe = :groupe,
		".$modif_mdp."
		url_photo = :url_photo,
		url_portfolio = :url_portfolio,
		motscles = :motscles
		WHERE id = :id
	");
	$resultat->bindParam('nom', $donnees["nom"], PDO::PARAM_STR);
	$resultat->bindParam('prenom', $donnees["prenom"], PDO::PARAM_STR);
	$resultat->bindParam('groupe', $donnees["groupe"], PDO::PARAM_STR);
	$resultat->bindParam('url_photo', $donnees["url_photo"], PDO::PARAM_STR);
	$resultat->bindParam('url_portfolio', $donnees["url_portfolio"], PDO::PARAM_STR);
	$resultat->bindParam('motscles', $donnees["motscles"], PDO::PARAM_STR);
	$resultat->bindParam('id', $id, PDO::PARAM_INT);
	if ($modif_mdp != "") {
		$resultat->bindParam('mdp', $donnees["mdp"], PDO::PARAM_STR);
	}

} else {

	foreach ($donnees as $key => $value) {
		if (empty($value)) {
			echo "Champ ".$label_donnees[$key]." est incorrect";
			exit();
		}
	}

	if ($mdp_clair != $donnees["mdpc"]) {
		echo "Confirmation de mot de passe incorrecte";
		exit();
	}

	$reponse = $bdd->prepare("SELECT `id` FROM `".TABLE_ESPACECEN."` WHERE nom='".$donnees["nom"]."' AND prenom='".$donnees["prenom"]."'");
	$reponse->execute();
	if ($reponse->rowCount() > 0) {
		echo "Le nom et le prénom sont déjà utilisés";
		return false;
	}

	$resultat = $bdd->prepare("INSERT INTO `".TABLE_ESPACECEN."`
		(`nom`, `prenom`, `groupe`, `mdp`, `url_photo`, `url_portfolio`, `motscles`)
		VALUES
		(
			:nom,
			:prenom,
			:groupe,
			:mdp,
			:url_photo,
			:url_portfolio,
			:motscles
		);");
	$resultat->bindParam('nom', $donnees["nom"], PDO::PARAM_STR);
	$resultat->bindParam('prenom', $donnees["prenom"], PDO::PARAM_STR);
	$resultat->bindParam('groupe', $donnees["groupe"], PDO::PARAM_STR);
	$resultat->bindParam('mdp', $donnees["mdp"], PDO::PARAM_STR);
	$resultat->bindParam('url_photo', $donnees["url_photo"], PDO::PARAM_STR);
	$resultat->bindParam('url_portfolio', $donnees["url_portfolio"], PDO::PARAM_STR);
	$resultat->bindParam('motscles', $donnees["motscles"], PDO::PARAM_STR);
}

if ($resultat->execute()) {
	if (!$edition) { //ajout
		mail_envoi($donnees); //envoi du mail pour prévenir de l'ajout
	}

	echo 1;
}
else {
	echo "Une erreur s'est produite. Veuillez réessayer.";
}


?>