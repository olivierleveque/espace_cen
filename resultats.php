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

$motscles = !empty($_GET["motscles"]) ? htmlspecialchars($_GET["motscles"]) : false;
$nb_res = !empty($_GET["nb_res"]) ? intval(htmlspecialchars($_GET["nb_res"])) : false;
$ordre = !empty($_GET["ordre"]) ? intval(htmlspecialchars($_GET["ordre"])) : false;


if ($motscles)
	$where = " WHERE valide = 1 AND ( motscles LIKE '%".$motscles."%' OR nom LIKE '%".$motscles."%' OR prenom LIKE '%".$motscles."%')";
else
	$where = " WHERE valide = 1";

if ($ordre)
	$ordre = " ORDER BY ";
else
	$ordre = " ORDER BY RAND()";

if ($nb_res)
	$limit = " LIMIT 0 , ".$nb_res;
else
	$limit = " LIMIT 0 , 10";



$requete = "SELECT `id`, `nom`, `prenom`, `groupe`, `url_photo`, `url_portfolio` FROM ".TABLE_ESPACECEN.$where.$ordre.$limit;

$reponse = $bdd->query($requete);

$result = false;
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
if ($result) {
	$retour = substr($retour,0,-1);
	$retour .= "]";
} else {
	$retour = 0;
}


echo $retour;

?>