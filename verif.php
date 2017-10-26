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

$id = !empty($_POST["id"]) ? htmlspecialchars($_POST["id"]) : "";
$mdp = !empty($_POST["mdp"]) ? md5(htmlspecialchars($_POST["mdp"])) : "";

$requete = "SELECT `id`, `nom`, `prenom`, `groupe`, `url_photo`, `url_portfolio`, `motscles` FROM ".TABLE_ESPACECEN." WHERE id = $id AND mdp = '$mdp'";
$reponse = $bdd->query($requete);

//test
if ($reponse->rowCount() == 1 ) { // OK

	$retour = "[";
	while ($donnees = $reponse->fetch(PDO::FETCH_ASSOC)) //chaque entree de la base
	{
		$result = true;
		$retour .= "{";
		foreach($donnees as $colonne => $valeur)
		{
			$retour .= "\"$colonne\":\"$valeur\",";
		}
		$retour = substr($retour,0,-1);
		$retour .= "},";
	}
	$retour = substr($retour,0,-1);
	$retour .= "]";

	echo utf8_encode($retour);

}
else echo 0;

?>