<?php

// ----------------------------------------------------------------------
// CONFIGURATION
// ----------------------------------------------------------------------

// Définir les extensions de fichiers à analyser
$fileExtensions = ['svg', 'html', 'htm', 'xml'];

// ----------------------------------------------------------------------
// LOGIQUE D'ANALYSE
// ----------------------------------------------------------------------

// 1. Initialiser les structures de données
// $idDetails : Stockera les détails de chaque occurrence : ['ID' => ['count' => X, 'locations' => [['file' => 'f.svg', 'line' => 12], ...]]]
$idDetails = [];
$totalFilesAnalyzed = 0;
$totalIDsFound = 0;

// Expression régulière pour trouver les attributs 'id="..."' ou 'id='...'
// i pour insensible à la casse, U pour ungreedy (non gourmand)
$pattern = '/id\s*=\s*["\']([^"\']+)["\']/iU';

// Parcourir les fichiers dans le dossier
foreach ($fileExtensions as $ext) {
    $files = glob("*.{$ext}");
    
    foreach ($files as $filePath) {
        // Ignorer le script d'analyse lui-même
        if ($filePath === basename(__FILE__)) {
            continue;
        }

        $totalFilesAnalyzed++;
        
        // Lire le fichier ligne par ligne
        // Ligne originale (cause de l'erreur) : 
        // $lines = file($filePath, FILE_IGNORE_EMPTY_LINES | FILE_SKIP_EMPTY_LINES);
        
        // Ligne CORRIGÉE : Lecture simple du fichier (sans les constantes)
        $lines = file($filePath); 
        
        $lineNumber = 0;
        foreach ($lines as $line) {
            $lineNumber++;
            
            // Exécuter la recherche d'ID sur la ligne actuelle
            if (preg_match_all($pattern, $line, $matches)) {
                
                // $matches[1] contient les valeurs réelles des ID trouvés sur cette ligne
                foreach ($matches[1] as $id) {
                    if (!empty($id)) {
                        $totalIDsFound++;
                        
                        // Initialiser l'entrée pour l'ID si elle n'existe pas
                        if (!isset($idDetails[$id])) {
                            $idDetails[$id] = ['count' => 0, 'locations' => []];
                        }
                        
                        // Incrémenter le compteur
                        $idDetails[$id]['count']++;
                        
                        // Ajouter la localisation (fichier et ligne)
                        $idDetails[$id]['locations'][] = [
                            'file' => $filePath,
                            'line' => $lineNumber,
                        ];
                    }
                }
            }
        }
    }
}

// 2. Préparer les résultats pour l'affichage (Conversion pour le tri)
$results = [];
foreach ($idDetails as $id => $data) {
    $results[] = [
        'ID' => $id,
        'Occurrences' => $data['count'],
        'Locations' => $data['locations'] // Détails de la localisation
    ];
}

// 3. Trier les résultats par Occurrences (du plus grand au plus petit)
usort($results, function($a, $b) {
    return $b['Occurrences'] <=> $a['Occurrences'];
});

// 4. Afficher le rapport HTML
$totalDuplicates = array_filter($results, function($item) {
    return $item['Occurrences'] > 1;
});

?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Rapport Détaillé des ID</title>
    <style>
        body { font-family: sans-serif; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
        .duplicate-row { background-color: #fdd; font-weight: bold; }
        .location-list { font-size: 0.9em; margin: 0; padding-left: 15px; }
        .duplicate-header { color: red; }
    </style>
</head>
<body>
    <h1>Rapport Détaillé des ID dans les Fichiers Locaux</h1>
    <p><strong>Fichiers analysés :</strong> <?php echo $totalFilesAnalyzed; ?></p>
    <p><strong>ID uniques trouvés :</strong> <?php echo count($idDetails); ?></p>
    <p><strong>Nombre total d'ID (y compris les doublons) :</strong> <?php echo $totalIDsFound; ?></p>

    <?php if (count($totalDuplicates) > 0): ?>
        <h2 class="duplicate-header">!!! ATTENTION : <?php echo count($totalDuplicates); ?> ID(s) EN DOUBLE TROUVÉ(S) !!!</h2>
        <p>Les doublons (Occurrences > 1) sont au début du tableau et surlignés en rouge.</p>
    <?php else: ?>
        <h2>Félicitations ! Aucun ID en double n'a été trouvé dans les fichiers analysés.</h2>
    <?php endif; ?>

    <hr>

    <?php if (!empty($results)): ?>
        <table>
            <thead>
                <tr>
                    <th style="width: 20%;">ID</th>
                    <th style="width: 10%;">Occurrences</th>
                    <th style="width: 70%;">Localisation des occurrences (Fichier:Ligne)</th>
                </tr>
            </thead>
            <tbody>
                <?php foreach ($results as $item): ?>
                    <?php $isDuplicate = $item['Occurrences'] > 1; ?>
                    <tr class="<?php echo $isDuplicate ? 'duplicate-row' : ''; ?>">
                        <td><?php echo htmlspecialchars($item['ID']); ?></td>
                        <td><?php echo $item['Occurrences']; ?></td>
                        <td>
                            <?php if ($isDuplicate): ?>
                                <ul class="location-list">
                                    <?php foreach ($item['Locations'] as $location): ?>
                                        <li><?php echo htmlspecialchars($location['file']) . " : Ligne " . $location['line']; ?></li>
                                    <?php endforeach; ?>
                                </ul>
                            <?php else: ?>
                                <?php echo htmlspecialchars($item['Locations'][0]['file']) . " : Ligne " . $item['Locations'][0]['line']; ?>
                            <?php endif; ?>
                        </td>
                    </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
    <?php else: ?>
        <p>Aucun ID n'a été trouvé dans les fichiers analysés.</p>
    <?php endif; ?>
</body>
</html>