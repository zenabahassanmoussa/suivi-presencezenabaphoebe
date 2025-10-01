import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createConnection } from 'mysql2/promise';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Configuration de la base de données
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'gestionnaire_ecole',
  password: process.env.DB_PASSWORD || 'password_gestionnaire_ecole',
  database: process.env.DB_NAME || 'ecole',
  port: process.env.DB_PORT || 3306
};

// Middleware de connexion à la DB
const getDBConnection = async () => {
  try {
    const connection = await createConnection(dbConfig);
    return connection;
  } catch (error) {
    console.error('❌ Erreur connexion DB:', error.message);
    throw error;
  }
};

// Middleware de logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Route pour initialiser la base de données avec des données de test
app.post('/api/init-db', async (req, res) => {
  let connection;
  try {
    connection = await getDBConnection();
    
    // Insertion des données de test
    // 1. Insertion des matières
    await connection.execute(`
      INSERT IGNORE INTO matieres (nom) VALUES 
      ('Grammaire'),
      ('Conjugaison'),
      ('Orthographe'),
      ('Mathématiques'),
      ('Histoire'),
      ('Géographie'),
      ('Sciences')
    `);
    
    // 2. Insertion des classes
    await connection.execute(`
      INSERT IGNORE INTO classes (nom) VALUES 
      ('CP1'),
      ('CP2'),
      ('CE1'),
      ('CE2'),
      ('CM1'),
      ('CM2')
    `);

    // 3. Insertion des sous-classes
    await connection.execute(`
      INSERT IGNORE INTO sous_classes (nom, classe_id) VALUES 
      ('CP1A', 1),
      ('CP1B', 1),
      ('CP2A', 2),
      ('CP2B', 2),
      ('CE1A', 3),
      ('CE1B', 3),
      ('CE2A', 4),
      ('CE2B', 4),
      ('CM1A', 5),
      ('CM1B', 5),
      ('CM2A', 6),
      ('CM2B', 6)
    `);

    // 4. Insertion des matières par classe
    await connection.execute(`
      INSERT IGNORE INTO matieres_classes (matiere_id, classe_id) VALUES 
      (1, 1), (2, 1), (3, 1), (4, 1),
      (1, 2), (2, 2), (3, 2), (4, 2),
      (1, 3), (2, 3), (3, 3), (4, 3), (5, 3), (6, 3),
      (1, 4), (2, 4), (3, 4), (4, 4), (5, 4), (6, 4),
      (1, 5), (2, 5), (3, 5), (4, 5), (5, 5), (6, 5), (7, 5),
      (1, 6), (2, 6), (3, 6), (4, 6), (5, 6), (6, 6), (7, 6)
    `);

    // 5. Insertion des enseignants (SANS MOT DE PASSE)
    await connection.execute(`
      INSERT IGNORE INTO enseignants (nom, prenom, email, telephone) VALUES 
      ('Kone', 'Fatou', 'fatou.kone@mail.com', '01 23 45 67 89'),
      ('Traore', 'Ibrahim', 'ibrahim.traore@mail.com', '01 34 56 78 90'),
      ('Diop', 'Mariama', 'mariama.diop@mail.com', '01 45 67 89 01'),
      ('Ba', 'Modou', 'modou.ba@mail.com', '01 56 78 90 12')
    `);

    // 6. Insertion des élèves
    await connection.execute(`
      INSERT IGNORE INTO eleves (nom, prenom, date_naissance, sous_classe_id) VALUES 
      ('Ndiaye', 'Amadou', '2017-03-15', 1),
      ('Diallo', 'Mariama', '2017-05-20', 1),
      ('Sow', 'Fatima', '2017-08-12', 1),
      ('Kane', 'Ibrahima', '2017-01-30', 1),
      ('Traore', 'Aïcha', '2017-04-25', 3),
      ('Diop', 'Moussa', '2017-07-18', 3),
      ('Ba', 'Khadija', '2017-09-22', 3),
      ('Fall', 'Ousmane', '2017-02-14', 3),
      ('Gueye', 'Rokhaya', '2016-11-08', 5),
      ('Mbaye', 'Cheikh', '2016-12-03', 5),
      ('Niang', 'Aminata', '2016-10-19', 5),
      ('Sy', 'Mamadou', '2016-06-27', 5)
    `);

    // 7. Insertion des associations enseignants-classes-matieres
    await connection.execute(`
      INSERT IGNORE INTO enseignants_classes_matieres (enseignant_id, sous_classe_id, matiere_id) VALUES 
      (1, 1, 1), (1, 1, 2), (1, 1, 3),
      (2, 3, 4), (2, 3, 1),
      (3, 5, 1), (3, 5, 2), (3, 5, 3), (3, 5, 4),
      (4, 7, 5), (4, 7, 6)
    `);

    // 8. Insertion des évaluations
    await connection.execute(`
      INSERT IGNORE INTO evaluations (nom, matiere_id) VALUES 
      ('Contrôle de grammaire - Chapitre 1', 1),
      ('Interrogation de conjugaison - Présent', 2),
      ('Test d\'orthographe - Dictée 1', 3),
      ('Devoir de mathématiques - Addition', 4),
      ('Contrôle d\'histoire - La Préhistoire', 5)
    `);

    // 9. Insertion des notes de test
    await connection.execute(`
      INSERT IGNORE INTO notes (evaluation_id, eleve_id, valeur) VALUES 
      (1, 1, 15.5), (1, 2, 13.0), (1, 3, 14.5), (1, 4, 12.0),
      (2, 1, 16.0), (2, 2, 14.0), (2, 3, 15.0), (2, 4, 13.5),
      (3, 5, 17.0), (3, 6, 16.5), (3, 7, 15.0), (3, 8, 14.5),
      (4, 9, 18.0), (4, 10, 16.5), (4, 11, 17.5), (4, 12, 15.0),
      (5, 9, 14.0), (5, 10, 13.5), (5, 11, 16.0), (5, 12, 12.5)
    `);

    res.json({ message: 'Base de données initialisée avec succès avec des données de test' });

  } catch (error) {
    console.error('Erreur initialisation DB:', error);
    res.status(500).json({ error: 'Erreur lors de l\'initialisation de la base de données' });
  } finally {
    if (connection) await connection.end();
  }
});

// Routes pour les enseignants
app.get('/api/enseignants', async (req, res) => {
  let connection;
  try {
    connection = await getDBConnection();
    
    const [enseignants] = await connection.execute(`
      SELECT id, nom, prenom, email, telephone 
      FROM enseignants 
      ORDER BY nom, prenom
    `);

    res.json({ enseignants });

  } catch (error) {
    console.error('Erreur fetch enseignants:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  } finally {
    if (connection) await connection.end();
  }
});

app.post('/api/enseignants', async (req, res) => {
  let connection;
  try {
    const { nom, prenom, email, telephone } = req.body;
    
    if (!nom || !prenom || !email) {
      return res.status(400).json({ error: 'Nom, prénom et email sont requis' });
    }

    connection = await getDBConnection();

    const [result] = await connection.execute(
      'INSERT INTO enseignants (nom, prenom, email, telephone) VALUES (?, ?, ?, ?)',
      [nom, prenom, email, telephone || null]
    );

    res.status(201).json({ 
      message: 'Enseignant créé avec succès', 
      enseignant_id: result.insertId 
    });

  } catch (error) {
    console.error('Erreur création enseignant:', error);
    res.status(500).json({ error: 'Erreur lors de la création de l\'enseignant' });
  } finally {
    if (connection) await connection.end();
  }
});

app.put('/api/enseignants/:id', async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    const { nom, prenom, email, telephone } = req.body;
    
    if (!nom || !prenom || !email) {
      return res.status(400).json({ error: 'Nom, prénom et email sont requis' });
    }

    connection = await getDBConnection();

    const [result] = await connection.execute(
      'UPDATE enseignants SET nom = ?, prenom = ?, email = ?, telephone = ? WHERE id = ?',
      [nom, prenom, email, telephone || null, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Enseignant non trouvé' });
    }

    res.json({ message: 'Enseignant modifié avec succès' });

  } catch (error) {
    console.error('Erreur modification enseignant:', error);
    res.status(500).json({ error: 'Erreur lors de la modification de l\'enseignant' });
  } finally {
    if (connection) await connection.end();
  }
});

app.delete('/api/enseignants/:id', async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    connection = await getDBConnection();

    await connection.execute(
      'DELETE FROM enseignants WHERE id = ?',
      [id]
    );

    res.json({ message: 'Enseignant supprimé avec succès' });

  } catch (error) {
    console.error('Erreur suppression enseignant:', error);
    res.status(500).json({ error: 'Erreur serveur lors de la suppression' });
  } finally {
    if (connection) await connection.end();
  }
});

// Routes pour les affectations des enseignants
app.get('/api/enseignants/affectations', async (req, res) => {
  let connection;
  try {
    connection = await getDBConnection();
    
    const [affectations] = await connection.execute(`
      SELECT ecm.id, 
             e.nom as enseignant_nom, e.prenom as enseignant_prenom,
             sc.nom as sous_classe_nom, c.nom as classe_nom,
             m.nom as matiere_nom
      FROM enseignants_classes_matieres ecm
      JOIN enseignants e ON ecm.enseignant_id = e.id
      JOIN sous_classes sc ON ecm.sous_classe_id = sc.id
      JOIN classes c ON sc.classe_id = c.id
      JOIN matieres m ON ecm.matiere_id = m.id
      ORDER BY e.nom, sc.nom, m.nom
    `);

    res.json({ affectations });

  } catch (error) {
    console.error('Erreur fetch affectations:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  } finally {
    if (connection) await connection.end();
  }
});

app.post('/api/enseignants/affectations', async (req, res) => {
  let connection;
  try {
    const { enseignant_id, sous_classe_id, matiere_id } = req.body;
    
    if (!enseignant_id || !sous_classe_id || !matiere_id) {
      return res.status(400).json({ error: 'Enseignant, sous-classe et matière sont requis' });
    }

    connection = await getDBConnection();

    // Vérifier si l'affectation existe déjà
    const [existing] = await connection.execute(
      'SELECT id FROM enseignants_classes_matieres WHERE enseignant_id = ? AND sous_classe_id = ? AND matiere_id = ?',
      [enseignant_id, sous_classe_id, matiere_id]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: 'Cette affectation existe déjà' });
    }

    const [result] = await connection.execute(
      'INSERT INTO enseignants_classes_matieres (enseignant_id, sous_classe_id, matiere_id) VALUES (?, ?, ?)',
      [enseignant_id, sous_classe_id, matiere_id]
    );

    res.status(201).json({ 
      message: 'Affectation créée avec succès', 
      affectation_id: result.insertId 
    });

  } catch (error) {
    console.error('Erreur création affectation:', error);
    res.status(500).json({ error: 'Erreur lors de la création de l\'affectation' });
  } finally {
    if (connection) await connection.end();
  }
});

app.delete('/api/enseignants/affectations/:id', async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    connection = await getDBConnection();

    await connection.execute(
      'DELETE FROM enseignants_classes_matieres WHERE id = ?',
      [id]
    );

    res.json({ message: 'Affectation supprimée avec succès' });

  } catch (error) {
    console.error('Erreur suppression affectation:', error);
    res.status(500).json({ error: 'Erreur serveur lors de la suppression' });
  } finally {
    if (connection) await connection.end();
  }
});

// Routes pour les classes
app.get('/api/classes', async (req, res) => {
  let connection;
  try {
    connection = await getDBConnection();
    
    const [classes] = await connection.execute('SELECT id, nom FROM classes ORDER BY nom');

    res.json({ classes });

  } catch (error) {
    console.error('Erreur fetch classes:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  } finally {
    if (connection) await connection.end();
  }
});

app.post('/api/classes', async (req, res) => {
  let connection;
  try {
    const { nom } = req.body;
    
    if (!nom) {
      return res.status(400).json({ error: 'Le nom de la classe est requis' });
    }

    connection = await getDBConnection();

    const [result] = await connection.execute(
      'INSERT INTO classes (nom) VALUES (?)',
      [nom]
    );

    res.status(201).json({ 
      message: 'Classe créée avec succès', 
      classe_id: result.insertId 
    });

  } catch (error) {
    console.error('Erreur création classe:', error);
    res.status(500).json({ error: 'Erreur lors de la création de la classe' });
  } finally {
    if (connection) await connection.end();
  }
});

app.put('/api/classes/:id', async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    const { nom } = req.body;
    
    if (!nom) {
      return res.status(400).json({ error: 'Le nom de la classe est requis' });
    }

    connection = await getDBConnection();

    const [result] = await connection.execute(
      'UPDATE classes SET nom = ? WHERE id = ?',
      [nom, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Classe non trouvée' });
    }

    res.json({ message: 'Classe modifiée avec succès' });

  } catch (error) {
    console.error('Erreur modification classe:', error);
    res.status(500).json({ error: 'Erreur lors de la modification de la classe' });
  } finally {
    if (connection) await connection.end();
  }
});

app.delete('/api/classes/:id', async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    connection = await getDBConnection();

    // Vérifier s'il y a des sous-classes associées
    const [sousClasses] = await connection.execute(
      'SELECT id FROM sous_classes WHERE classe_id = ?',
      [id]
    );

    if (sousClasses.length > 0) {
      return res.status(400).json({ 
        error: 'Impossible de supprimer cette classe car elle contient des sous-classes' 
      });
    }

    const [result] = await connection.execute(
      'DELETE FROM classes WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Classe non trouvée' });
    }

    res.json({ message: 'Classe supprimée avec succès' });

  } catch (error) {
    console.error('Erreur suppression classe:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression de la classe' });
  } finally {
    if (connection) await connection.end();
  }
});

// Routes pour les sous-classes
app.get('/api/sous-classes', async (req, res) => {
  let connection;
  try {
    connection = await getDBConnection();
    
    const [sousClasses] = await connection.execute(`
      SELECT sc.id, sc.nom, c.nom as classe_nom 
      FROM sous_classes sc
      JOIN classes c ON sc.classe_id = c.id
      ORDER BY c.nom, sc.nom
    `);

    res.json({ sous_classes: sousClasses });

  } catch (error) {
    console.error('Erreur fetch sous-classes:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  } finally {
    if (connection) await connection.end();
  }
});

app.post('/api/sous-classes', async (req, res) => {
  let connection;
  try {
    const { nom, classe_id } = req.body;
    
    if (!nom || !classe_id) {
      return res.status(400).json({ error: 'Le nom et la classe sont requis' });
    }

    connection = await getDBConnection();

    const [result] = await connection.execute(
      'INSERT INTO sous_classes (nom, classe_id) VALUES (?, ?)',
      [nom, classe_id]
    );

    res.status(201).json({ 
      message: 'Sous-classe créée avec succès', 
      sous_classe_id: result.insertId 
    });

  } catch (error) {
    console.error('Erreur création sous-classe:', error);
    res.status(500).json({ error: 'Erreur lors de la création de la sous-classe' });
  } finally {
    if (connection) await connection.end();
  }
});

app.put('/api/sous-classes/:id', async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    const { nom, classe_id } = req.body;
    
    if (!nom || !classe_id) {
      return res.status(400).json({ error: 'Le nom et la classe sont requis' });
    }

    connection = await getDBConnection();

    const [result] = await connection.execute(
      'UPDATE sous_classes SET nom = ?, classe_id = ? WHERE id = ?',
      [nom, classe_id, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Sous-classe non trouvée' });
    }

    res.json({ message: 'Sous-classe modifiée avec succès' });

  } catch (error) {
    console.error('Erreur modification sous-classe:', error);
    res.status(500).json({ error: 'Erreur lors de la modification de la sous-classe' });
  } finally {
    if (connection) await connection.end();
  }
});

app.delete('/api/sous-classes/:id', async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    connection = await getDBConnection();

    // Vérifier s'il y a des élèves associés
    const [eleves] = await connection.execute(
      'SELECT id FROM eleves WHERE sous_classe_id = ?',
      [id]
    );

    if (eleves.length > 0) {
      return res.status(400).json({ 
        error: 'Impossible de supprimer cette sous-classe car elle contient des élèves' 
      });
    }

    // Vérifier s'il y a des affectations d'enseignants
    const [affectations] = await connection.execute(
      'SELECT id FROM enseignants_classes_matieres WHERE sous_classe_id = ?',
      [id]
    );

    if (affectations.length > 0) {
      return res.status(400).json({ 
        error: 'Impossible de supprimer cette sous-classe car elle a des enseignants affectés' 
      });
    }

    const [result] = await connection.execute(
      'DELETE FROM sous_classes WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Sous-classe non trouvée' });
    }

    res.json({ message: 'Sous-classe supprimée avec succès' });

  } catch (error) {
    console.error('Erreur suppression sous-classe:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression de la sous-classe' });
  } finally {
    if (connection) await connection.end();
  }
});

// Route pour récupérer les élèves d'une sous-classe
app.get('/api/sous-classe/:sousClasseId/eleves', async (req, res) => {
  let connection;
  try {
    const { sousClasseId } = req.params;
    connection = await getDBConnection();

    const [eleves] = await connection.execute(
      `SELECT e.id, e.nom, e.prenom, e.date_naissance, sc.nom as sous_classe_nom
       FROM eleves e 
       JOIN sous_classes sc ON e.sous_classe_id = sc.id
       WHERE e.sous_classe_id = ?`,
      [sousClasseId]
    );

    res.json({ eleves });

  } catch (error) {
    console.error('Erreur fetch élèves sous-classe:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  } finally {
    if (connection) await connection.end();
  }
});

// Route pour créer un élève
app.post('/api/eleves', async (req, res) => {
  let connection;
  try {
    const { prenom, nom, date_naissance, sous_classe_id } = req.body;
    
    if (!prenom || !nom || !date_naissance || !sous_classe_id) {
      return res.status(400).json({ error: 'Tous les champs sont requis' });
    }

    connection = await getDBConnection();

    // Créer l'élève
    const [result] = await connection.execute(
      'INSERT INTO eleves (nom, prenom, date_naissance, sous_classe_id) VALUES (?, ?, ?, ?)',
      [nom, prenom, date_naissance, sous_classe_id]
    );

    res.status(201).json({ 
      message: 'Élève créé avec succès', 
      eleve_id: result.insertId 
    });

  } catch (error) {
    console.error('Erreur création élève:', error);
    res.status(500).json({ error: 'Erreur lors de la création de l\'élève' });
  } finally {
    if (connection) await connection.end();
  }
});

app.put('/api/eleves/:id', async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    const { prenom, nom, date_naissance, sous_classe_id } = req.body;
    
    if (!prenom || !nom || !date_naissance || !sous_classe_id) {
      return res.status(400).json({ error: 'Tous les champs sont requis' });
    }

    connection = await getDBConnection();

    const [result] = await connection.execute(
      'UPDATE eleves SET nom = ?, prenom = ?, date_naissance = ?, sous_classe_id = ? WHERE id = ?',
      [nom, prenom, date_naissance, sous_classe_id, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Élève non trouvé' });
    }

    res.json({ message: 'Élève modifié avec succès' });

  } catch (error) {
    console.error('Erreur modification élève:', error);
    res.status(500).json({ error: 'Erreur lors de la modification de l\'élève' });
  } finally {
    if (connection) await connection.end();
  }
});

// Route pour supprimer un élève
app.delete('/api/eleves/:id', async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    connection = await getDBConnection();

    await connection.execute(
      'DELETE FROM eleves WHERE id = ?',
      [id]
    );

    res.json({ message: 'Élève supprimé avec succès' });

  } catch (error) {
    console.error('Erreur suppression élève:', error);
    res.status(500).json({ error: 'Erreur serveur lors de la suppression' });
  } finally {
    if (connection) await connection.end();
  }
});

// Routes pour les présences
app.post('/api/presences/date', async (req, res) => {
  let connection;
  try {
    console.log('Requête présences date reçue:', req.body);
    
    const { date, sous_classe_id } = req.body;
    
    if (!date || !sous_classe_id) {
      return res.status(400).json({ 
        success: false, 
        error: 'Paramètres date et sous_classe_id requis' 
      });
    }

    connection = await getDBConnection();
    
    // Récupérer les présences pour la date et la sous-classe spécifiées
    const [presences] = await connection.execute(
      `SELECT p.*, e.nom as eleve_nom, e.prenom as eleve_prenom 
       FROM presences p 
       JOIN eleves e ON p.eleve_id = e.id 
       WHERE p.date = ? AND e.sous_classe_id = ? 
       ORDER BY e.nom, e.prenom`,
      [date, sous_classe_id]
    );

    console.log(`Nombre de présences trouvées pour ${date} et sous-classe ${sous_classe_id}:`, presences.length);
    
    res.status(200).json({ 
      success: true, 
      data: presences 
    });

  } catch (error) {
    console.error('Erreur serveur dans /api/presences/date:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  } finally {
    if (connection) await connection.end();
  }
});

// Route pour enregistrer/mettre à jour une présence
app.post('/api/presences', async (req, res) => {
  let connection;
  try {
    const { eleve_id, date, present, heure_arrivee } = req.body;
    connection = await getDBConnection();

    // Vérifier si une présence existe déjà pour cet élève à cette date
    const [existing] = await connection.execute(
      'SELECT id FROM presences WHERE eleve_id = ? AND date = ?',
      [eleve_id, date]
    );

    if (existing.length > 0) {
      // Mettre à jour la présence existante
      await connection.execute(
        'UPDATE presences SET present = ?, heure_arrivee = ? WHERE id = ?',
        [present, heure_arrivee, existing[0].id]
      );
      res.json({ message: 'Présence mise à jour avec succès' });
    } else {
      // Créer une nouvelle présence
      await connection.execute(
        'INSERT INTO presences (eleve_id, date, present, heure_arrivee) VALUES (?, ?, ?, ?)',
        [eleve_id, date, present, heure_arrivee]
      );
      res.status(201).json({ message: 'Présence enregistrée avec succès' });
    }

  } catch (error) {
    console.error('Erreur mise à jour présence:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  } finally {
    if (connection) await connection.end();
  }
});

// Routes pour les matières
app.get('/api/matieres', async (req, res) => {
  let connection;
  try {
    connection = await getDBConnection();
    
    const [matieres] = await connection.execute('SELECT id, nom FROM matieres ORDER BY nom');

    res.json({ matieres });

  } catch (error) {
    console.error('Erreur fetch matières:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  } finally {
    if (connection) await connection.end();
  }
});

app.post('/api/matieres', async (req, res) => {
  let connection;
  try {
    const { nom } = req.body;
    connection = await getDBConnection();

    const [result] = await connection.execute(
      'INSERT INTO matieres (nom) VALUES (?)',
      [nom]
    );

    res.status(201).json({ 
      message: 'Matière créée avec succès', 
      matiere_id: result.insertId 
    });

  } catch (error) {
    console.error('Erreur création matière:', error);
    res.status(500).json({ error: 'Erreur lors de la création' });
  } finally {
    if (connection) await connection.end();
  }
});

app.put('/api/matieres/:id', async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    const { nom } = req.body;
    
    if (!nom) {
      return res.status(400).json({ error: 'Le nom de la matière est requis' });
    }

    connection = await getDBConnection();

    const [result] = await connection.execute(
      'UPDATE matieres SET nom = ? WHERE id = ?',
      [nom, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Matière non trouvée' });
    }

    res.json({ message: 'Matière modifiée avec succès' });

  } catch (error) {
    console.error('Erreur modification matière:', error);
    res.status(500).json({ error: 'Erreur lors de la modification' });
  } finally {
    if (connection) await connection.end();
  }
});

// NOUVELLE ROUTE DELETE POUR MATIERES
app.delete('/api/matieres/:id', async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    connection = await getDBConnection();

    // Vérifier s'il y a des évaluations associées
    const [evaluations] = await connection.execute(
      'SELECT id FROM evaluations WHERE matiere_id = ?',
      [id]
    );

    if (evaluations.length > 0) {
      return res.status(400).json({ 
        error: 'Impossible de supprimer cette matière car elle contient des évaluations' 
      });
    }

    // Vérifier s'il y a des affectations d'enseignants
    const [affectations] = await connection.execute(
      'SELECT id FROM enseignants_classes_matieres WHERE matiere_id = ?',
      [id]
    );

    if (affectations.length > 0) {
      return res.status(400).json({ 
        error: 'Impossible de supprimer cette matière car elle a des enseignants affectés' 
      });
    }

    const [result] = await connection.execute(
      'DELETE FROM matieres WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Matière non trouvée' });
    }

    res.json({ message: 'Matière supprimée avec succès' });

  } catch (error) {
    console.error('Erreur suppression matière:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression de la matière' });
  } finally {
    if (connection) await connection.end();
  }
});

// Routes pour les évaluations
app.get('/api/matiere/:matiereId/evaluations', async (req, res) => {
  let connection;
  try {
    const { matiereId } = req.params;
    connection = await getDBConnection();

    const [evaluations] = await connection.execute(
      `SELECT e.*, m.nom as matiere_nom 
       FROM evaluations e 
       JOIN matieres m ON e.matiere_id = m.id 
       WHERE e.matiere_id = ?`,
      [matiereId]
    );

    res.json({ evaluations });

  } catch (error) {
    console.error('Erreur fetch évaluations:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  } finally {
    if (connection) await connection.end();
  }
});

app.post('/api/evaluations', async (req, res) => {
  let connection;
  try {
    const { nom, matiere_id } = req.body;
    connection = await getDBConnection();

    const [result] = await connection.execute(
      'INSERT INTO evaluations (nom, matiere_id) VALUES (?, ?)',
      [nom, matiere_id]
    );

    res.status(201).json({ 
      message: 'Évaluation créée avec succès', 
      evaluation_id: result.insertId 
    });

  } catch (error) {
    console.error('Erreur création évaluation:', error);
    res.status(500).json({ error: 'Erreur lors de la création' });
  } finally {
    if (connection) await connection.end();
  }
});

app.put('/api/evaluations/:id', async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    const { nom, matiere_id } = req.body;
    
    if (!nom || !matiere_id) {
      return res.status(400).json({ error: 'Le nom et la matière sont requis' });
    }

    connection = await getDBConnection();

    const [result] = await connection.execute(
      'UPDATE evaluations SET nom = ?, matiere_id = ? WHERE id = ?',
      [nom, matiere_id, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Évaluation non trouvée' });
    }

    res.json({ message: 'Évaluation modifiée avec succès' });

  } catch (error) {
    console.error('Erreur modification évaluation:', error);
    res.status(500).json({ error: 'Erreur lors de la modification' });
  } finally {
    if (connection) await connection.end();
  }
});

// NOUVELLE ROUTE DELETE POUR EVALUATIONS
app.delete('/api/evaluations/:id', async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    connection = await getDBConnection();

    // Vérifier s'il y a des notes associées
    const [notes] = await connection.execute(
      'SELECT id FROM notes WHERE evaluation_id = ?',
      [id]
    );

    if (notes.length > 0) {
      return res.status(400).json({ 
        error: 'Impossible de supprimer cette évaluation car elle contient des notes' 
      });
    }

    const [result] = await connection.execute(
      'DELETE FROM evaluations WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Évaluation non trouvée' });
    }

    res.json({ message: 'Évaluation supprimée avec succès' });

  } catch (error) {
    console.error('Erreur suppression évaluation:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression de l\'évaluation' });
  } finally {
    if (connection) await connection.end();
  }
});

// Routes pour les notes
app.get('/api/evaluation/:evaluationId/notes', async (req, res) => {
  let connection;
  try {
    const { evaluationId } = req.params;
    connection = await getDBConnection();

    const [notes] = await connection.execute(
      `SELECT n.*, e.nom as eleve_nom, e.prenom as eleve_prenom 
       FROM notes n 
       JOIN eleves e ON n.eleve_id = e.id 
       WHERE n.evaluation_id = ?`,
      [evaluationId]
    );

    res.json({ notes });

  } catch (error) {
    console.error('Erreur fetch notes:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  } finally {
    if (connection) await connection.end();
  }
});

app.post('/api/notes', async (req, res) => {
  let connection;
  try {
    const { evaluation_id, eleve_id, valeur } = req.body;
    connection = await getDBConnection();

    // Vérifier si une note existe déjà pour cet élève et cette évaluation
    const [existing] = await connection.execute(
      'SELECT id FROM notes WHERE evaluation_id = ? AND eleve_id = ?',
      [evaluation_id, eleve_id]
    );

    if (existing.length > 0) {
      // Mettre à jour la note existante
      await connection.execute(
        'UPDATE notes SET valeur = ? WHERE id = ?',
        [valeur, existing[0].id]
      );
      res.json({ message: 'Note mise à jour avec succès' });
    } else {
      // Créer une nouvelle note
      await connection.execute(
        'INSERT INTO notes (evaluation_id, eleve_id, valeur) VALUES (?, ?, ?)',
        [evaluation_id, eleve_id, valeur]
      );
      res.status(201).json({ message: 'Note enregistrée avec succès' });
    }

  } catch (error) {
    console.error('Erreur mise à jour note:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  } finally {
    if (connection) await connection.end();
  }
});

// NOUVELLE ROUTE DELETE POUR NOTES
app.delete('/api/notes/:id', async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    connection = await getDBConnection();

    const [result] = await connection.execute(
      'DELETE FROM notes WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Note non trouvée' });
    }

    res.json({ message: 'Note supprimée avec succès' });

  } catch (error) {
    console.error('Erreur suppression note:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression de la note' });
  } finally {
    if (connection) await connection.end();
  }
});

// ========== ROUTES COMPLÉMENTAIRES ==========

// Récupérer toutes les notes d'un élève
app.get('/api/eleves/:eleveId/notes', async (req, res) => {
  let connection;
  try {
    const { eleveId } = req.params;
    connection = await getDBConnection();

    const [notes] = await connection.execute(
      `SELECT n.*, ev.nom as evaluation_nom, m.nom as matiere_nom, m.id as matiere_id
       FROM notes n 
       JOIN evaluations ev ON n.evaluation_id = ev.id
       JOIN matieres m ON ev.matiere_id = m.id
       WHERE n.eleve_id = ?
       ORDER BY m.nom, ev.nom`,
      [eleveId]
    );

    res.json({ notes });

  } catch (error) {
    console.error('Erreur fetch notes élève:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  } finally {
    if (connection) await connection.end();
  }
});

// Récupérer les notes d'une sous-classe pour une matière spécifique
app.get('/api/sous-classe/:sousClasseId/matiere/:matiereId/notes', async (req, res) => {
  let connection;
  try {
    const { sousClasseId, matiereId } = req.params;
    connection = await getDBConnection();

    const [notes] = await connection.execute(
      `SELECT n.*, e.nom as eleve_nom, e.prenom as eleve_prenom, ev.nom as evaluation_nom
       FROM notes n 
       JOIN eleves e ON n.eleve_id = e.id
       JOIN evaluations ev ON n.evaluation_id = ev.id
       WHERE e.sous_classe_id = ? AND ev.matiere_id = ?
       ORDER BY e.nom, e.prenom, ev.nom`,
      [sousClasseId, matiereId]
    );

    res.json({ notes });

  } catch (error) {
    console.error('Erreur fetch notes sous-classe/matière:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  } finally {
    if (connection) await connection.end();
  }
});

// Récupérer les évaluations disponibles pour une sous-classe et matière
app.get('/api/sous-classe/:sousClasseId/matiere/:matiereId/evaluations', async (req, res) => {
  let connection;
  try {
    const { sousClasseId, matiereId } = req.params;
    connection = await getDBConnection();

    const [evaluations] = await connection.execute(
      `SELECT ev.*, m.nom as matiere_nom
       FROM evaluations ev
       JOIN matieres m ON ev.matiere_id = m.id
       WHERE ev.matiere_id = ? 
       AND EXISTS (
         SELECT 1 FROM eleves e 
         WHERE e.sous_classe_id = ?
       )
       ORDER BY ev.nom`,
      [matiereId, sousClasseId]
    );

    res.json({ evaluations });

  } catch (error) {
    console.error('Erreur fetch évaluations sous-classe/matière:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  } finally {
    if (connection) await connection.end();
  }
});

// Récupérer le bulletin d'un élève (moyennes par matière)
app.get('/api/eleves/:eleveId/bulletin', async (req, res) => {
  let connection;
  try {
    const { eleveId } = req.params;
    connection = await getDBConnection();

    const [bulletin] = await connection.execute(
      `SELECT m.id as matiere_id, m.nom as matiere_nom, 
              AVG(n.valeur) as moyenne, 
              COUNT(n.id) as nombre_notes,
              MIN(n.valeur) as note_min,
              MAX(n.valeur) as note_max
       FROM notes n
       JOIN evaluations ev ON n.evaluation_id = ev.id
       JOIN matieres m ON ev.matiere_id = m.id
       WHERE n.eleve_id = ?
       GROUP BY m.id, m.nom
       ORDER BY m.nom`,
      [eleveId]
    );

    res.json({ bulletin });

  } catch (error) {
    console.error('Erreur fetch bulletin:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  } finally {
    if (connection) await connection.end();
  }
});

// Récupérer les statistiques de notes d'une évaluation
app.get('/api/evaluation/:evaluationId/statistiques', async (req, res) => {
  let connection;
  try {
    const { evaluationId } = req.params;
    connection = await getDBConnection();

    const [stats] = await connection.execute(
      `SELECT COUNT(n.id) as nombre_notes,
              AVG(n.valeur) as moyenne,
              MIN(n.valeur) as note_min,
              MAX(n.valeur) as note_max,
              COUNT(CASE WHEN n.valeur >= 10 THEN 1 END) as nombre_admis,
              COUNT(CASE WHEN n.valeur < 10 THEN 1 END) as nombre_ajournes
       FROM notes n
       WHERE n.evaluation_id = ?`,
      [evaluationId]
    );

    res.json({ statistiques: stats[0] });

  } catch (error) {
    console.error('Erreur fetch statistiques:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  } finally {
    if (connection) await connection.end();
  }
});

// Mettre à jour une note spécifique
app.put('/api/notes/:noteId', async (req, res) => {
  let connection;
  try {
    const { noteId } = req.params;
    const { valeur } = req.body;
    
    if (valeur === undefined || valeur === null) {
      return res.status(400).json({ error: 'La valeur de la note est requise' });
    }

    connection = await getDBConnection();

    const [result] = await connection.execute(
      'UPDATE notes SET valeur = ? WHERE id = ?',
      [valeur, noteId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Note non trouvée' });
    }

    res.json({ message: 'Note mise à jour avec succès' });

  } catch (error) {
    console.error('Erreur mise à jour note:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  } finally {
    if (connection) await connection.end();
  }
});

// Route pour enregistrer plusieurs notes en une seule requête (batch)
app.post('/api/notes/batch', async (req, res) => {
  let connection;
  try {
    const { notes } = req.body;
    
    if (!Array.isArray(notes) || notes.length === 0) {
      return res.status(400).json({ error: 'Un tableau de notes est requis' });
    }

    connection = await getDBConnection();

    // Commencer une transaction
    await connection.execute('START TRANSACTION');

    try {
      for (const noteData of notes) {
        const { evaluation_id, eleve_id, valeur } = noteData;

        // Vérifier si une note existe déjà
        const [existing] = await connection.execute(
          'SELECT id FROM notes WHERE evaluation_id = ? AND eleve_id = ?',
          [evaluation_id, eleve_id]
        );

        if (existing.length > 0) {
          // Mettre à jour la note existante
          await connection.execute(
            'UPDATE notes SET valeur = ? WHERE id = ?',
            [valeur, existing[0].id]
          );
        } else {
          // Créer une nouvelle note
          await connection.execute(
            'INSERT INTO notes (evaluation_id, eleve_id, valeur) VALUES (?, ?, ?)',
            [evaluation_id, eleve_id, valeur]
          );
        }
      }

      // Valider la transaction
      await connection.execute('COMMIT');
      res.status(201).json({ message: `${notes.length} notes enregistrées avec succès` });

    } catch (error) {
      // Annuler la transaction en cas d'erreur
      await connection.execute('ROLLBACK');
      throw error;
    }

  } catch (error) {
    console.error('Erreur enregistrement batch notes:', error);
    res.status(500).json({ error: 'Erreur lors de l\'enregistrement des notes' });
  } finally {
    if (connection) await connection.end();
  }
});

// Route pour vérifier l'état du serveur
app.get('/api/health', async (req, res) => {
  try {
    const connection = await getDBConnection();
    await connection.end();
    res.json({ 
      status: 'OK', 
      message: 'Serveur et base de données fonctionnent', 
      timestamp: new Date().toISOString() 
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'ERROR', 
      message: 'Problème de connexion à la base de données', 
      error: error.message 
    });
  }
});

// Gestion des erreurs 404
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route non trouvée' });
});

// Gestionnaire d'erreurs global
app.use((error, req, res, next) => {
  console.error('Erreur globale:', error);
  res.status(500).json({ error: 'Erreur interne du serveur' });
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  console.log(`🌐 API disponible: http://localhost:${PORT}/api`);
  console.log(`📊 Connexion DB: ${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`);
  console.log(`📋 Initialisez la base de données avec: POST http://localhost:${PORT}/api/init-db`);
});

export default app;