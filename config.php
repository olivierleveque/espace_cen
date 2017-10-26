<?php

//config

define("HOTE", "");
define("LOGIN", "");
define("PASS", "");
define("BASE", "");

define("TABLE_ESPACECEN", "");

define("CHEMIN_DOSSIER_PHOTO", "photos_utilisateurs");

function mail_envoi ($array) {
	$mail = "olivier@gmail.com, lenaig@gmail.com, adele@gmail.com"; // D&eacute;claration de l'adresse de destination.
	if (!preg_match("#^[a-z0-9._-]+@(hotmail|live|msn).[a-z]{2,4}$#", $mail)) { // On filtre les serveurs qui rencontrent des bogues.
		$passage_ligne = "\r\n";
	}
	else
	{
		$passage_ligne = "\n";
	}
	
	//=====D&eacute;claration des messages au format texte et au format HTML.
	$message_txt = "";
	$message_html = '<html>
	<head>
		<title></title>
	</head>
   
	<body>
		<center>
			<h3>Nouvel ajout</h3>
			<div>Nom : <strong>'.$array["nom"].'</strong></div>
			<div>Prénom : <strong>'.$array["prenom"].'</strong></div>
			<div>Groupe : <strong>'.$array["groupe"].'</strong></div>
			<div>URL Photo : <strong>'.$array["url_photo"].'</strong></div>
			<div>URL CV : <strong>'.$array["url_portfolio"].'</strong></div>
			<div>Mots Cles : <strong>'.$array["motscles"].'</strong></div>
		</center>
	</body>
</html>';
	//==========
	 
	//=====Cr&eacute;ation de la boundary
	$boundary = "-----=".md5(rand());
	//==========
	 
	//=====D&eacute;finition du sujet.
	$sujet = "[ESPACE CEN] Nouvel ajout";
	//=========
	 
	//=====Cr&eacute;ation du header de l'e-mail.
	$header = "From: \"ESPACE CEN\"<abllo2014@yahoo.fr>".$passage_ligne;
	$header.= "Reply-to: \"ESPACE CEN\"<abllo2014@yahoo.fr>".$passage_ligne;
	$header.= "MIME-Version: 1.0".$passage_ligne;
	$header.= "Content-Type: multipart/alternative;".$passage_ligne." boundary=\"$boundary\"".$passage_ligne;
	//==========
	 
	//=====Cr&eacute;ation du message.
	$message = $passage_ligne.$boundary.$passage_ligne;
	//=====Ajout du message au format texte.
	$message.= "Content-Type: text/plain; charset=\"ISO-8859-1\"".$passage_ligne;
	$message.= "Content-Transfer-Encoding: 8bit".$passage_ligne;
	$message.= $passage_ligne.$message_txt.$passage_ligne;
	//==========
	$message.= $passage_ligne."--".$boundary.$passage_ligne;
	//=====Ajout du message au format HTML
	$message.= "Content-Type: text/html; charset=\"ISO-8859-1\"".$passage_ligne;
	$message.= "Content-Transfer-Encoding: 8bit".$passage_ligne;
	$message.= $passage_ligne.$message_html.$passage_ligne;
	//==========
	$message.= $passage_ligne."--".$boundary."--".$passage_ligne;
	$message.= $passage_ligne."--".$boundary."--".$passage_ligne;
	//==========
	 
	//=====Envoi de l'e-mail.
	if (mail($mail,$sujet,$message,$header))
		return true;
	else
		return false;
	//==========
}

?>