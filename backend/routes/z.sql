CREATE DATABASE IF NOT EXISTS ecole;

USE ecole;

CREATE TABLE IF NOT EXISTS matieres(
    id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    nom VARCHAR(255) -- Ex: Grammaire, Conjugaison, orthographe, ...
);

-- Tables class
-- Ex: CP1, CP2, ...
CREATE TABLE IF NOT EXISTS classes(
    id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    nom VARCHAR(255) UNIQUE
);

-- Table sous classe
-- Ex: CP1A, CP1B, ...
CREATE TABLE IF NOT EXISTS sous_classes(
    id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    nom VARCHAR(255),
    classe_id INT UNSIGNED,
    CONSTRAINT fk_sous_classes_classe_id FOREIGN KEY (classe_id) REFERENCES classes(id)
);

CREATE TABLE IF NOT EXISTS matieres_classes(
    id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    matiere_id INT UNSIGNED,
    classe_id INT UNSIGNED,
    CONSTRAINT fk_matieres_classes_matiere_id FOREIGN KEY (matiere_id) REFERENCES matieres(id),
    CONSTRAINT fk_matieres_classes_classe_id FOREIGN KEY (classe_id) REFERENCES classes(id),
    CONSTRAINT uk_matieres_classes_classe_id_matiere_id UNIQUE KEY(matiere_id, classe_id)
);

CREATE TABLE IF NOT EXISTS eleves(
    id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    nom VARCHAR(255),
    prenom VARCHAR(255),
    date_naissance DATE,
    sous_classe_id INT UNSIGNED,
    CONSTRAINT fk_eleves_sous_classe_id FOREIGN KEY (sous_classe_id) REFERENCES sous_classes(id),
    CONSTRAINT uk_eleves_nom_prenom_date_naissance UNIQUE KEY(nom, prenom, date_naissance)
);

CREATE TABLE IF NOT EXISTS presences(
    id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    eleve_id INT UNSIGNED NOT NULL,
    date DATE NOT NULL,
    present BOOLEAN DEFAULT FALSE,
    heure_arrivee TIME NULL,
    justification TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_presences_eleve_id FOREIGN KEY (eleve_id) REFERENCES eleves(id) ON DELETE CASCADE,
    CONSTRAINT uk_presences_eleve_date UNIQUE KEY (eleve_id, date)
);

CREATE TABLE IF NOT EXISTS evaluations(
    id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    nom VARCHAR(255),
    matiere_id INT UNSIGNED,
    CONSTRAINT fk_evaluation_matiere_id FOREIGN KEY (matiere_id) REFERENCES matieres(id)
);



CREATE TABLE IF NOT EXISTS notes(
    id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    evaluation_id INT UNSIGNED,
    eleve_id INT UNSIGNED,
    valeur DOUBLE UNSIGNED,
    CONSTRAINT fk_notes_evaluation_id FOREIGN KEY(evaluation_id) REFERENCES evaluations(id),
    CONSTRAINT fk_notes_eleve_id FOREIGN KEY(eleve_id) REFERENCES eleves(id),
    CONSTRAINT uk_notes_evaluation_eleve UNIQUE KEY(evaluation_id, eleve_id)
);

CREATE TABLE IF NOT EXISTS enseignants(
    id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    nom VARCHAR(255),
    prenom VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    telephone VARCHAR(20)
);

CREATE TABLE IF NOT EXISTS enseignants_classes_matieres(
    id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    enseignant_id INT UNSIGNED,
    sous_classe_id INT UNSIGNED,
    matiere_id INT UNSIGNED,
    FOREIGN KEY (enseignant_id) REFERENCES enseignants(id),
    FOREIGN KEY (sous_classe_id) REFERENCES sous_classes(id),
    FOREIGN KEY (matiere_id) REFERENCES matieres(id)
);

CREATE USER IF NOT EXISTS gestionnaire_ecole@localhost;
GRANT ALL PRIVILEGES ON ecole.* TO gestionnaire_ecole@localhost IDENTIFIED BY "password_gestionnaire_ecole";
FLUSH PRIVILEGES;