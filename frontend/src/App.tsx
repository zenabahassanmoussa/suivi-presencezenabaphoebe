import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './App.css';

// Interfaces
interface Classe {
  id: number;
  nom: string;
}

interface SousClasse {
  id: number;
  nom: string;
  classe_id: number;
  classe_nom?: string;
}

interface Eleve {
  id: number;
  nom: string;
  prenom: string;
  date_naissance: string;
  sous_classe_id: number;
  sous_classe_nom?: string;
  classe_nom?: string;
}

interface Presence {
  id: number;
  eleve_id: number;
  date: string;
  present: boolean;
  heure_arrivee: string | null;
  justification: string | null;
  eleve_nom: string;
  eleve_prenom: string;
  sous_classe_nom?: string;
}

interface Matiere {
  id: number;
  nom: string;
}

interface Evaluation {
  id: number;
  nom: string;
  matiere_id: number;
  matiere_nom?: string;
}

interface Note {
  id: number;
  evaluation_id: number;
  eleve_id: number;
  valeur: number;
  evaluation_nom?: string;
  eleve_nom?: string;
  eleve_prenom?: string;
  matiere_nom?: string;
}

interface Enseignant {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
}

interface Affectation {
  id: number;
  enseignant_id: number;
  sous_classe_id: number;
  matiere_id: number;
  enseignant_nom: string;
  enseignant_prenom: string;
  sous_classe_nom: string;
  classe_nom: string;
  matiere_nom: string;
}

// Composants
const Dashboard: React.FC = () => {
  return (
    <div className="dashboard">
      <h2>📈 Tableau de Bord - Gestion Scolaire </h2>
      <div className="user-info">
        <p>🌟 Bienvenue dans le système de gestion scolaire professionnel</p>
      </div>
      
      <div className="dashboard-actions">
        <div className="action-card">
          <h3>📅 Gestion des présences</h3>
          <p>Marquer et suivre les présences des élèves</p>
          <a href="#/presences">📊 Accéder aux présences</a>
        </div>
        <div className="action-card">
          <h3>👨‍🎓 Gestion des élèves</h3>
          <p>Gérer le parcours des élèves</p>
          <a href="#/eleves">🎓 Gérer les élèves</a>
        </div>
        <div className="action-card">
          <h3>🎯 Gestion des notes</h3>
          <p>Évaluations et bulletins</p>
          <a href="#/notes">📝 Gérer les notes</a>
        </div>
        <div className="action-card">
          <h3>👨‍🏫 Gestion des enseignants</h3>
          <p>Personnel et affectations</p>
          <a href="#/enseignants">💼 Gérer les enseignants</a>
        </div>
        <div className="action-card">
          <h3>🏫 Gestion des classes</h3>
          <p>Organisation pédagogique</p>
          <a href="#/classes">📚 Gérer les classes</a>
        </div>
      </div>
    </div>
  );
};

const PresenceManager: React.FC = () => {
  const [sousClasses, setSousClasses] = useState<SousClasse[]>([]);
  const [selectedSousClasse, setSelectedSousClasse] = useState<number | null>(null);
  const [eleves, setEleves] = useState<Eleve[]>([]);
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [presences, setPresences] = useState<Presence[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchSousClasses();
  }, []);

  const fetchSousClasses = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/sous-classes');
      setSousClasses(response.data.sous_classes);
    } catch (error) {
      console.error('Erreur fetch sous-classes:', error);
    }
  };

  const fetchElevesSousClasse = async (sousClasseId: number) => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/api/sous-classe/${sousClasseId}/eleves`);
      setEleves(response.data.eleves);
      setSelectedSousClasse(sousClasseId);
      fetchPresencesDate(sousClasseId);
    } catch (error) {
      console.error('Erreur fetch élèves sous-classe:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPresencesDate = async (sousClasseId: number) => {
    try {
      const response = await axios.post('http://localhost:5000/api/presences/date', {
        date,
        sous_classe_id: sousClasseId
      });
      setPresences(response.data.data);
    } catch (error) {
      console.error('Erreur fetch présences date:', error);
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setDate(newDate);
    if (selectedSousClasse) {
      fetchPresencesDate(selectedSousClasse);
    }
  };

  const updatePresence = async (eleveId: number, present: boolean) => {
    try {
      await axios.post('http://localhost:5000/api/presences', {
        eleve_id: eleveId,
        date,
        present,
        heure_arrivee: present ? new Date().toTimeString().split(' ')[0] : null
      });

      setPresences(prev => {
        const existing = prev.find(p => p.eleve_id === eleveId && p.date === date);
        if (existing) {
          return prev.map(p => 
            p.eleve_id === eleveId && p.date === date 
              ? { ...p, present, heure_arrivee: present ? new Date().toTimeString().split(' ')[0] : null }
              : p
          );
        } else {
          return [
            ...prev,
            {
              id: Date.now(),
              eleve_id: eleveId,
              date,
              present,
              heure_arrivee: present ? new Date().toTimeString().split(' ')[0] : null,
              justification: null,
              eleve_nom: eleves.find(e => e.id === eleveId)?.nom || '',
              eleve_prenom: eleves.find(e => e.id === eleveId)?.prenom || ''
            }
          ];
        }
      });
      
      setMessage('✅ Présence enregistrée avec succès');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Erreur mise à jour présence:', error);
      setMessage('❌ Erreur lors de l\'enregistrement');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const toggleAllPresences = async (present: boolean) => {
    if (!selectedSousClasse || eleves.length === 0) return;

    try {
      const promises = eleves.map(eleve => 
        axios.post('http://localhost:5000/api/presences', {
          eleve_id: eleve.id,
          date,
          present,
          heure_arrivee: present ? new Date().toTimeString().split(' ')[0] : null
        })
      );

      await Promise.all(promises);

      setPresences(eleves.map(eleve => ({
        id: Date.now() + eleve.id,
        eleve_id: eleve.id,
        date,
        present,
        heure_arrivee: present ? new Date().toTimeString().split(' ')[0] : null,
        justification: null,
        eleve_nom: eleve.nom,
        eleve_prenom: eleve.prenom
      })));

      setMessage(`✅ Tous les élèves marqués comme ${present ? 'présents' : 'absents'}`);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Erreur mise à jour des présences:', error);
      setMessage('❌ Erreur lors de la mise à jour des présences');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  return (
    <div className="presence-manager">
      <h2>📅 Gestion des Présences</h2>
      
      {message && <div className={`message ${message.includes('❌') ? 'error' : 'success'}`}>{message}</div>}
      
      <div className="filters">
        <div className="form-group">
          <label>📅 Date:</label>
          <input
            type="date"
            value={date}
            onChange={handleDateChange}
          />
        </div>
        
        <div className="form-group">
          <label>🏫 Sous-classe:</label>
          <select
            value={selectedSousClasse || ''}
            onChange={(e) => {
              const sousClasseId = Number(e.target.value);
              if (sousClasseId) {
                fetchElevesSousClasse(sousClasseId);
              } else {
                setSelectedSousClasse(null);
                setEleves([]);
                setPresences([]);
              }
            }}
          >
            <option value="">Sélectionner une sous-classe</option>
            {sousClasses.map(sousClasse => (
              <option key={sousClasse.id} value={sousClasse.id}>
                {sousClasse.nom} - {sousClasse.classe_nom}
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedSousClasse && eleves.length > 0 && (
        <div className="presence-actions">
          <button 
            onClick={() => toggleAllPresences(true)}
            className="action-btn present-all-btn"
          >
            ✅ Tous présents
          </button>
          <button 
            onClick={() => toggleAllPresences(false)}
            className="action-btn absent-all-btn"
          >
            ❌ Tous absents
          </button>
        </div>
      )}

      {loading && <div className="loading">⏳ Chargement...</div>}

      {selectedSousClasse && eleves.length > 0 && (
        <div className="presence-list">
          <h3>👨‍🎓 Liste des élèves - {sousClasses.find(s => s.id === selectedSousClasse)?.nom}</h3>
          <table>
            <thead>
              <tr>
                <th>Élève</th>
                <th>Présent</th>
                <th>Absent</th>
                <th>Heure d'arrivée</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {eleves.map(eleve => {
                const presence = presences.find(p => p.eleve_id === eleve.id);
                const status = presence ? (presence.present ? 'Présent' : 'Absent') : 'Non renseigné';
                
                return (
                  <tr key={eleve.id}>
                    <td>{eleve.prenom} {eleve.nom}</td>
                    <td>
                      <input
                        type="radio"
                        name={`presence-${eleve.id}`}
                        checked={presence?.present === true}
                        onChange={() => updatePresence(eleve.id, true)}
                      />
                    </td>
                    <td>
                      <input
                        type="radio"
                        name={`presence-${eleve.id}`}
                        checked={presence?.present === false}
                        onChange={() => updatePresence(eleve.id, false)}
                      />
                    </td>
                    <td>{presence?.heure_arrivee || '-'}</td>
                    <td className={`status ${status.toLowerCase().replace(' ', '-')}`}>
                      {status}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const EleveManager: React.FC = () => {
  const [sousClasses, setSousClasses] = useState<SousClasse[]>([]);
  const [eleves, setEleves] = useState<Eleve[]>([]);
  const [selectedSousClasse, setSelectedSousClasse] = useState<number | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingEleve, setEditingEleve] = useState<Eleve | null>(null);
  const [newEleve, setNewEleve] = useState({
    nom: '',
    prenom: '',
    date_naissance: '',
    sous_classe_id: ''
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchSousClasses();
  }, []);

  const fetchSousClasses = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/sous-classes');
      setSousClasses(response.data.sous_classes);
    } catch (error) {
      console.error('Erreur fetch sous-classes:', error);
    }
  };

  const fetchElevesSousClasse = async (sousClasseId: number) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/sous-classe/${sousClasseId}/eleves`);
      setEleves(response.data.eleves);
      setSelectedSousClasse(sousClasseId);
    } catch (error) {
      console.error('Erreur fetch élèves sous-classe:', error);
    }
  };

  const addEleve = async () => {
    if (!newEleve.nom || !newEleve.prenom || !newEleve.date_naissance || !newEleve.sous_classe_id) {
      setMessage('❌ Veuillez remplir tous les champs');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    try {
      const payload = {
        nom: newEleve.nom,
        prenom: newEleve.prenom,
        date_naissance: newEleve.date_naissance,
        sous_classe_id: Number(newEleve.sous_classe_id)
      };

      await axios.post('http://localhost:5000/api/eleves', payload);
      
      setNewEleve({ nom: '', prenom: '', date_naissance: '', sous_classe_id: '' });
      setShowAddForm(false);
      if (selectedSousClasse) {
        fetchElevesSousClasse(selectedSousClasse);
      }
      setMessage('✅ Élève ajouté avec succès');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Erreur ajout élève:', error);
      setMessage('❌ Erreur lors de l\'ajout de l\'élève');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const updateEleve = async () => {
    if (!editingEleve) return;

    try {
      const payload = {
        nom: editingEleve.nom,
        prenom: editingEleve.prenom,
        date_naissance: editingEleve.date_naissance,
        sous_classe_id: editingEleve.sous_classe_id
      };

      await axios.put(`http://localhost:5000/api/eleves/${editingEleve.id}`, payload);
      
      setEditingEleve(null);
      if (selectedSousClasse) {
        fetchElevesSousClasse(selectedSousClasse);
      }
      setMessage('✅ Élève modifié avec succès');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Erreur modification élève:', error);
      setMessage('❌ Erreur lors de la modification');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const deleteEleve = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet élève ?')) {
      try {
        await axios.delete(`http://localhost:5000/api/eleves/${id}`);
        
        if (selectedSousClasse) {
          fetchElevesSousClasse(selectedSousClasse);
        }
        setMessage('✅ Élève supprimé avec succès');
        setTimeout(() => setMessage(''), 3000);
      } catch (error) {
        console.error('Erreur suppression élève:', error);
        setMessage('❌ Erreur lors de la suppression');
        setTimeout(() => setMessage(''), 3000);
      }
    }
  };

  const startEdit = (eleve: Eleve) => {
    setEditingEleve({...eleve});
    setShowAddForm(false);
  };

  const cancelEdit = () => {
    setEditingEleve(null);
  };

  return (
    <div className="eleve-manager">
      <h2>👨‍🎓 Gestion des Élèves</h2>
      
      {message && <div className={`message ${message.includes('❌') ? 'error' : 'success'}`}>{message}</div>}
      
      <div className="filters">
        <div className="form-group">
          <label>🏫 Sous-classe:</label>
          <select
            value={selectedSousClasse || ''}
            onChange={(e) => {
              const sousClasseId = Number(e.target.value);
              if (sousClasseId) {
                fetchElevesSousClasse(sousClasseId);
              } else {
                setSelectedSousClasse(null);
                setEleves([]);
              }
            }}
          >
            <option value="">Sélectionner une sous-classe</option>
            {sousClasses.map(sousClasse => (
              <option key={sousClasse.id} value={sousClasse.id}>
                {sousClasse.nom} - {sousClasse.classe_nom}
              </option>
            ))}
          </select>
        </div>
        
        <button 
          onClick={() => {
            setShowAddForm(!showAddForm);
            setEditingEleve(null);
          }}
          className="toggle-form-btn"
        >
          {showAddForm ? '❌ Annuler' : '➕ Ajouter un élève'}
        </button>
      </div>

      {(showAddForm || editingEleve) && (
        <div className="add-form">
          <h3>{editingEleve ? '✎ Modifier l\'Élève' : '➕ Nouvel Élève'}</h3>
          <div className="form-row">
            <div className="form-group">
              <input
                type="text"
                placeholder="Nom"
                value={editingEleve ? editingEleve.nom : newEleve.nom}
                onChange={(e) => editingEleve 
                  ? setEditingEleve({...editingEleve, nom: e.target.value})
                  : setNewEleve({...newEleve, nom: e.target.value})
                }
              />
            </div>
            <div className="form-group">
              <input
                type="text"
                placeholder="Prénom"
                value={editingEleve ? editingEleve.prenom : newEleve.prenom}
                onChange={(e) => editingEleve
                  ? setEditingEleve({...editingEleve, prenom: e.target.value})
                  : setNewEleve({...newEleve, prenom: e.target.value})
                }
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>📅 Date de naissance:</label>
              <input
                type="date"
                value={editingEleve ? editingEleve.date_naissance : newEleve.date_naissance}
                onChange={(e) => editingEleve
                  ? setEditingEleve({...editingEleve, date_naissance: e.target.value})
                  : setNewEleve({...newEleve, date_naissance: e.target.value})
                }
              />
            </div>
            <div className="form-group">
              <label>🏫 Sous-classe:</label>
              <select
                value={editingEleve ? editingEleve.sous_classe_id.toString() : newEleve.sous_classe_id}
                onChange={(e) => editingEleve
                  ? setEditingEleve({...editingEleve, sous_classe_id: Number(e.target.value)})
                  : setNewEleve({...newEleve, sous_classe_id: e.target.value})
                }
              >
                <option value="">Sélectionner une sous-classe</option>
                {sousClasses.map(sousClasse => (
                  <option key={sousClasse.id} value={sousClasse.id}>
                    {sousClasse.nom} - {sousClasse.classe_nom}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-actions">
            {editingEleve ? (
              <>
                <button onClick={updateEleve} className="add-btn">💾 Modifier l'élève</button>
                <button onClick={cancelEdit} className="cancel-btn">❌ Annuler</button>
              </>
            ) : (
              <button onClick={addEleve} className="add-btn">➕ Ajouter l'élève</button>
            )}
          </div>
        </div>
      )}

      {selectedSousClasse && eleves.length > 0 && (
        <div className="eleves-list">
          <h3>📋 Élèves de {sousClasses.find(s => s.id === selectedSousClasse)?.nom}</h3>
          <table>
            <thead>
              <tr>
                <th>Nom</th>
                <th>Prénom</th>
                <th>Date de naissance</th>
                <th>Sous-classe</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {eleves.map(eleve => (
                <tr key={eleve.id}>
                  <td>{eleve.nom}</td>
                  <td>{eleve.prenom}</td>
                  <td>{new Date(eleve.date_naissance).toLocaleDateString('fr-FR')}</td>
                  <td>{eleve.sous_classe_nom}</td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        onClick={() => startEdit(eleve)}
                        className="edit-btn"
                      >
                        🔄
                      </button>
                      <button 
                        onClick={() => deleteEleve(eleve.id)}
                        className="delete-btn"
                      >
                        ❌
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const NoteManager: React.FC = () => {
  const [sousClasses, setSousClasses] = useState<SousClasse[]>([]);
  const [matieres, setMatieres] = useState<Matiere[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [eleves, setEleves] = useState<Eleve[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedSousClasse, setSelectedSousClasse] = useState<number | null>(null);
  const [selectedMatiere, setSelectedMatiere] = useState<number | null>(null);
  const [selectedEvaluation, setSelectedEvaluation] = useState<number | null>(null);
  const [showAddEvaluation, setShowAddEvaluation] = useState(false);
  const [editingEvaluation, setEditingEvaluation] = useState<Evaluation | null>(null);
  const [newEvaluation, setNewEvaluation] = useState({
    nom: '',
    matiere_id: ''
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchSousClasses();
    fetchMatieres();
  }, []);

  const fetchSousClasses = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/sous-classes');
      setSousClasses(response.data.sous_classes);
    } catch (error) {
      console.error('Erreur fetch sous-classes:', error);
    }
  };

  const fetchMatieres = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/matieres');
      setMatieres(response.data.matieres);
    } catch (error) {
      console.error('Erreur fetch matières:', error);
    }
  };

  const fetchEvaluations = async (matiereId: number) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/matiere/${matiereId}/evaluations`);
      setEvaluations(response.data.evaluations);
    } catch (error) {
      console.error('Erreur fetch évaluations:', error);
    }
  };

  const fetchElevesSousClasse = async (sousClasseId: number) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/sous-classe/${sousClasseId}/eleves`);
      setEleves(response.data.eleves);
      setSelectedSousClasse(sousClasseId);
    } catch (error) {
      console.error('Erreur fetch élèves sous-classe:', error);
    }
  };

  const fetchNotesEvaluation = async (evaluationId: number) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/evaluation/${evaluationId}/notes`);
      setNotes(response.data.notes);
      setSelectedEvaluation(evaluationId);
    } catch (error) {
      console.error('Erreur fetch notes:', error);
    }
  };

  const addEvaluation = async () => {
    if (!newEvaluation.nom || !newEvaluation.matiere_id) {
      setMessage('❌ Veuillez remplir tous les champs');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    try {
      await axios.post('http://localhost:5000/api/evaluations', {
        nom: newEvaluation.nom,
        matiere_id: Number(newEvaluation.matiere_id)
      });
      
      setNewEvaluation({ nom: '', matiere_id: '' });
      setShowAddEvaluation(false);
      if (selectedMatiere) {
        fetchEvaluations(selectedMatiere);
      }
      setMessage('✅ Évaluation créée avec succès');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Erreur création évaluation:', error);
      setMessage('❌ Erreur lors de la création');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const updateEvaluation = async () => {
    if (!editingEvaluation) return;

    try {
      await axios.put(`http://localhost:5000/api/evaluations/${editingEvaluation.id}`, {
        nom: editingEvaluation.nom,
        matiere_id: editingEvaluation.matiere_id
      });
      
      setEditingEvaluation(null);
      if (selectedMatiere) {
        fetchEvaluations(selectedMatiere);
      }
      setMessage('✅ Évaluation modifiée avec succès');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Erreur modification évaluation:', error);
      setMessage('❌ Erreur lors de la modification');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const deleteEvaluation = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette évaluation ?')) {
      try {
        await axios.delete(`http://localhost:5000/api/evaluations/${id}`);
        
        if (selectedMatiere) {
          fetchEvaluations(selectedMatiere);
        }
        setMessage('✅ Évaluation supprimée avec succès');
        setTimeout(() => setMessage(''), 3000);
      } catch (error) {
        console.error('Erreur suppression évaluation:', error);
        setMessage('❌ Erreur lors de la suppression');
        setTimeout(() => setMessage(''), 3000);
      }
    }
  };

  const updateNote = async (eleveId: number, valeur: number) => {
    if (!selectedEvaluation) return;

    try {
      await axios.post('http://localhost:5000/api/notes', {
        evaluation_id: selectedEvaluation,
        eleve_id: eleveId,
        valeur
      });

      // Mettre à jour les notes localement
      setNotes(prev => {
        const existing = prev.find(n => n.eleve_id === eleveId);
        if (existing) {
          return prev.map(n => 
            n.eleve_id === eleveId ? { ...n, valeur } : n
          );
        } else {
          return [
            ...prev,
            {
              id: Date.now(),
              evaluation_id: selectedEvaluation,
              eleve_id: eleveId,
              valeur,
              eleve_nom: eleves.find(e => e.id === eleveId)?.nom,
              eleve_prenom: eleves.find(e => e.id === eleveId)?.prenom
            }
          ];
        }
      });

      setMessage('✅ Note enregistrée avec succès');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Erreur mise à jour note:', error);
      setMessage('❌ Erreur lors de l\'enregistrement');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const deleteNote = async (noteId: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette note ?')) {
      try {
        await axios.delete(`http://localhost:5000/api/notes/${noteId}`);
        
        setNotes(prev => prev.filter(n => n.id !== noteId));
        setMessage('✅ Note supprimée avec succès');
        setTimeout(() => setMessage(''), 3000);
      } catch (error) {
        console.error('Erreur suppression note:', error);
        setMessage('❌ Erreur lors de la suppression');
        setTimeout(() => setMessage(''), 3000);
      }
    }
  };

  const startEditEvaluation = (evaluation: Evaluation) => {
    setEditingEvaluation({...evaluation});
    setShowAddEvaluation(false);
  };

  const cancelEditEvaluation = () => {
    setEditingEvaluation(null);
  };

  const NoteRow: React.FC<{ eleve: Eleve }> = ({ eleve }) => {
    const note = notes.find(n => n.eleve_id === eleve.id);
    const [valeur, setValeur] = useState(note?.valeur.toString() || '');

    return (
      <tr key={eleve.id}>
        <td>{eleve.prenom} {eleve.nom}</td>
        <td>
          <input
            type="number"
            min="0"
            max="20"
            step="0.5"
            value={valeur}
            onChange={(e) => setValeur(e.target.value)}
            className="note-input"
          />
        </td>
        <td>
          <div className="action-buttons">
            <button 
              onClick={() => updateNote(eleve.id, parseFloat(valeur))}
              className="save-note-btn"
              disabled={!valeur}
            >
              💾
            </button>
            {note && (
              <button 
                onClick={() => deleteNote(note.id)}
                className="delete-btn"
              >
                ❌
              </button>
            )}
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div className="note-manager">
      <h2>🎯 Gestion des Notes</h2>
      
      {message && <div className={`message ${message.includes('❌') ? 'error' : 'success'}`}>{message}</div>}
      
      <div className="filters">
        <div className="form-group">
          <label>🏫 Sous-classe:</label>
          <select
            value={selectedSousClasse || ''}
            onChange={(e) => {
              const sousClasseId = Number(e.target.value);
              if (sousClasseId) {
                fetchElevesSousClasse(sousClasseId);
              } else {
                setSelectedSousClasse(null);
                setEleves([]);
              }
            }}
          >
            <option value="">Sélectionner une sous-classe</option>
            {sousClasses.map(sousClasse => (
              <option key={sousClasse.id} value={sousClasse.id}>
                {sousClasse.nom} - {sousClasse.classe_nom}
              </option>
            ))}
          </select>
        </div>
        
        <div className="form-group">
          <label>📚 Matière:</label>
          <select
            value={selectedMatiere || ''}
            onChange={(e) => {
              const matiereId = Number(e.target.value);
              setSelectedMatiere(matiereId);
              if (matiereId) {
                fetchEvaluations(matiereId);
              } else {
                setEvaluations([]);
              }
            }}
          >
            <option value="">Sélectionner une matière</option>
            {matieres.map(matiere => (
              <option key={matiere.id} value={matiere.id}>
                {matiere.nom}
              </option>
            ))}
          </select>
        </div>

        <button 
          onClick={() => {
            setShowAddEvaluation(!showAddEvaluation);
            setEditingEvaluation(null);
          }}
          className="toggle-form-btn"
        >
          {showAddEvaluation ? '❌ Annuler' : '➕ Nouvelle évaluation'}
        </button>
      </div>

      {(showAddEvaluation || editingEvaluation) && (
        <div className="add-form">
          <h3>{editingEvaluation ? '✎ Modifier l\'Évaluation' : '➕ Nouvelle Évaluation'}</h3>
          <div className="form-row">
            <div className="form-group">
              <input
                type="text"
                placeholder="Nom de l'évaluation"
                value={editingEvaluation ? editingEvaluation.nom : newEvaluation.nom}
                onChange={(e) => editingEvaluation
                  ? setEditingEvaluation({...editingEvaluation, nom: e.target.value})
                  : setNewEvaluation({...newEvaluation, nom: e.target.value})
                }
              />
            </div>
            <div className="form-group">
              <select
                value={editingEvaluation ? editingEvaluation.matiere_id.toString() : newEvaluation.matiere_id}
                onChange={(e) => editingEvaluation
                  ? setEditingEvaluation({...editingEvaluation, matiere_id: Number(e.target.value)})
                  : setNewEvaluation({...newEvaluation, matiere_id: e.target.value})
                }
              >
                <option value="">Sélectionner une matière</option>
                {matieres.map(matiere => (
                  <option key={matiere.id} value={matiere.id}>
                    {matiere.nom}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-actions">
            {editingEvaluation ? (
              <>
                <button onClick={updateEvaluation} className="add-btn">💾 Modifier l'évaluation</button>
                <button onClick={cancelEditEvaluation} className="cancel-btn">❌ Annuler</button>
              </>
            ) : (
              <button onClick={addEvaluation} className="add-btn">➕ Créer l'évaluation</button>
            )}
          </div>
        </div>
      )}

      {selectedSousClasse && selectedMatiere && evaluations.length > 0 && (
        <div className="evaluations-section">
          <h3>📝 Évaluations - {matieres.find(m => m.id === selectedMatiere)?.nom}</h3>
          <div className="evaluations-list">
            {evaluations.map(evaluation => (
              <div key={evaluation.id} className="evaluation-card">
                <h4>{evaluation.nom}</h4>
                <div className="evaluation-actions">
                  <button 
                    onClick={() => fetchNotesEvaluation(evaluation.id)}
                    className="view-notes-btn"
                  >
                    📊 Voir/Modifier les notes
                  </button>
                  <button 
                    onClick={() => startEditEvaluation(evaluation)}
                    className="edit-btn"
                  >
                    🔄
                  </button>
                  <button 
                    onClick={() => deleteEvaluation(evaluation.id)}
                    className="delete-btn"
                  >
                    ❌
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {notes.length > 0 && (
        <div className="notes-editor">
          <h3>✏️ Saisie des notes - {evaluations.find(e => e.id === selectedEvaluation)?.nom}</h3>
          <table>
            <thead>
              <tr>
                <th>Élève</th>
                <th>Note</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {eleves.map(eleve => (
                <NoteRow key={eleve.id} eleve={eleve} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const EnseignantManager: React.FC = () => {
  const [enseignants, setEnseignants] = useState<Enseignant[]>([]);
  const [sousClasses, setSousClasses] = useState<SousClasse[]>([]);
  const [matieres, setMatieres] = useState<Matiere[]>([]);
  const [affectations, setAffectations] = useState<Affectation[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAffectationForm, setShowAffectationForm] = useState(false);
  const [editingEnseignant, setEditingEnseignant] = useState<Enseignant | null>(null);
  const [newEnseignant, setNewEnseignant] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: ''
  });
  const [newAffectation, setNewAffectation] = useState({
    enseignant_id: '',
    sous_classe_id: '',
    matiere_id: ''
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchEnseignants();
    fetchSousClasses();
    fetchMatieres();
    fetchAffectations();
  }, []);

  const fetchEnseignants = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/enseignants');
      setEnseignants(response.data.enseignants);
    } catch (error) {
      console.error('Erreur fetch enseignants:', error);
    }
  };

  const fetchSousClasses = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/sous-classes');
      setSousClasses(response.data.sous_classes);
    } catch (error) {
      console.error('Erreur fetch sous-classes:', error);
    }
  };

  const fetchMatieres = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/matieres');
      setMatieres(response.data.matieres);
    } catch (error) {
      console.error('Erreur fetch matières:', error);
    }
  };

  const fetchAffectations = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/enseignants/affectations');
      setAffectations(response.data.affectations);
    } catch (error) {
      console.error('Erreur fetch affectations:', error);
    }
  };

  const addEnseignant = async () => {
    if (!newEnseignant.nom || !newEnseignant.prenom || !newEnseignant.email) {
      setMessage('❌ Veuillez remplir tous les champs obligatoires');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    try {
      await axios.post('http://localhost:5000/api/enseignants', newEnseignant);
      setNewEnseignant({ nom: '', prenom: '', email: '', telephone: '' });
      setShowAddForm(false);
      fetchEnseignants();
      setMessage('✅ Enseignant créé avec succès');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Erreur ajout enseignant:', error);
      setMessage('❌ Erreur lors de la création');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const updateEnseignant = async () => {
    if (!editingEnseignant) return;

    try {
      await axios.put(`http://localhost:5000/api/enseignants/${editingEnseignant.id}`, editingEnseignant);
      setEditingEnseignant(null);
      fetchEnseignants();
      setMessage('✅ Enseignant modifié avec succès');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Erreur modification enseignant:', error);
      setMessage('❌ Erreur lors de la modification');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const addAffectation = async () => {
    if (!newAffectation.enseignant_id || !newAffectation.sous_classe_id || !newAffectation.matiere_id) {
      setMessage('❌ Veuillez sélectionner tous les champs');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    try {
      await axios.post('http://localhost:5000/api/enseignants/affectations', newAffectation);
      setNewAffectation({ enseignant_id: '', sous_classe_id: '', matiere_id: '' });
      setShowAffectationForm(false);
      fetchAffectations();
      setMessage('✅ Affectation créée avec succès');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Erreur ajout affectation:', error);
      setMessage('❌ Erreur lors de la création de l\'affectation');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const deleteEnseignant = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet enseignant ?')) {
      try {
        await axios.delete(`http://localhost:5000/api/enseignants/${id}`);
        fetchEnseignants();
        fetchAffectations();
        setMessage('✅ Enseignant supprimé avec succès');
        setTimeout(() => setMessage(''), 3000);
      } catch (error) {
        console.error('Erreur suppression enseignant:', error);
        setMessage('❌ Erreur lors de la suppression');
        setTimeout(() => setMessage(''), 3000);
      }
    }
  };

  const deleteAffectation = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette affectation ?')) {
      try {
        await axios.delete(`http://localhost:5000/api/enseignants/affectations/${id}`);
        fetchAffectations();
        setMessage('✅ Affectation supprimée avec succès');
        setTimeout(() => setMessage(''), 3000);
      } catch (error) {
        console.error('Erreur suppression affectation:', error);
        setMessage('❌ Erreur lors de la suppression');
        setTimeout(() => setMessage(''), 3000);
      }
    }
  };

  const startEdit = (enseignant: Enseignant) => {
    setEditingEnseignant({...enseignant});
    setShowAddForm(false);
  };

  const cancelEdit = () => {
    setEditingEnseignant(null);
  };

  return (
    <div className="enseignant-manager">
      <h2>👨‍🏫 Gestion des Enseignants</h2>
      
      {message && <div className={`message ${message.includes('❌') ? 'error' : 'success'}`}>{message}</div>}
      
      <div className="management-actions">
        <button 
          onClick={() => {
            setShowAddForm(!showAddForm);
            setEditingEnseignant(null);
          }}
          className="toggle-form-btn"
        >
          {showAddForm ? '❌ Annuler' : '➕ Ajouter un enseignant'}
        </button>
        <button 
          onClick={() => setShowAffectationForm(!showAffectationForm)}
          className="toggle-form-btn"
        >
          {showAffectationForm ? '❌ Annuler' : '🔗 Nouvelle affectation'}
        </button>
      </div>

      {(showAddForm || editingEnseignant) && (
        <div className="add-form">
          <h3>{editingEnseignant ? '✎ Modifier l\'Enseignant' : '➕ Nouvel Enseignant'}</h3>
          <div className="form-row">
            <div className="form-group">
              <input
                type="text"
                placeholder="Nom"
                value={editingEnseignant ? editingEnseignant.nom : newEnseignant.nom}
                onChange={(e) => editingEnseignant
                  ? setEditingEnseignant({...editingEnseignant, nom: e.target.value})
                  : setNewEnseignant({...newEnseignant, nom: e.target.value})
                }
              />
            </div>
            <div className="form-group">
              <input
                type="text"
                placeholder="Prénom"
                value={editingEnseignant ? editingEnseignant.prenom : newEnseignant.prenom}
                onChange={(e) => editingEnseignant
                  ? setEditingEnseignant({...editingEnseignant, prenom: e.target.value})
                  : setNewEnseignant({...newEnseignant, prenom: e.target.value})
                }
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <input
                type="email"
                placeholder="Email"
                value={editingEnseignant ? editingEnseignant.email : newEnseignant.email}
                onChange={(e) => editingEnseignant
                  ? setEditingEnseignant({...editingEnseignant, email: e.target.value})
                  : setNewEnseignant({...newEnseignant, email: e.target.value})
                }
              />
            </div>
            <div className="form-group">
              <input
                type="text"
                placeholder="Téléphone"
                value={editingEnseignant ? editingEnseignant.telephone : newEnseignant.telephone}
                onChange={(e) => editingEnseignant
                  ? setEditingEnseignant({...editingEnseignant, telephone: e.target.value})
                  : setNewEnseignant({...newEnseignant, telephone: e.target.value})
                }
              />
            </div>
          </div>
          <div className="form-actions">
            {editingEnseignant ? (
              <>
                <button onClick={updateEnseignant} className="add-btn">💾 Modifier l'enseignant</button>
                <button onClick={cancelEdit} className="cancel-btn">❌ Annuler</button>
              </>
            ) : (
              <button onClick={addEnseignant} className="add-btn">➕ Ajouter l'enseignant</button>
            )}
          </div>
        </div>
      )}

      {showAffectationForm && (
        <div className="add-form">
          <h3>🔗 Nouvelle Affectation</h3>
          <div className="form-row">
            <div className="form-group">
              <label>👨‍🏫 Enseignant:</label>
              <select
                value={newAffectation.enseignant_id}
                onChange={(e) => setNewAffectation({...newAffectation, enseignant_id: e.target.value})}
              >
                <option value="">Sélectionner un enseignant</option>
                {enseignants.map(enseignant => (
                  <option key={enseignant.id} value={enseignant.id}>
                    {enseignant.prenom} {enseignant.nom}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>🏫 Sous-classe:</label>
              <select
                value={newAffectation.sous_classe_id}
                onChange={(e) => setNewAffectation({...newAffectation, sous_classe_id: e.target.value})}
              >
                <option value="">Sélectionner une sous-classe</option>
                {sousClasses.map(sousClasse => (
                  <option key={sousClasse.id} value={sousClasse.id}>
                    {sousClasse.nom} - {sousClasse.classe_nom}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>📚 Matière:</label>
            <select
              value={newAffectation.matiere_id}
              onChange={(e) => setNewAffectation({...newAffectation, matiere_id: e.target.value})}
            >
              <option value="">Sélectionner une matière</option>
              {matieres.map(matiere => (
                <option key={matiere.id} value={matiere.id}>
                  {matiere.nom}
                </option>
              ))}
            </select>
          </div>
          <button onClick={addAffectation} className="add-btn">🔗 Créer l'affectation</button>
        </div>
      )}

      <div className="enseignants-section">
        <h3>📋 Liste des Enseignants</h3>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Nom</th>
                <th>Prénom</th>
                <th>Email</th>
                <th>Téléphone</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {enseignants.map(enseignant => (
                <tr key={enseignant.id}>
                  <td>{enseignant.nom}</td>
                  <td>{enseignant.prenom}</td>
                  <td>{enseignant.email}</td>
                  <td>{enseignant.telephone || '-'}</td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        onClick={() => startEdit(enseignant)}
                        className="edit-btn"
                      >
                        🔄
                      </button>
                      <button 
                        onClick={() => deleteEnseignant(enseignant.id)}
                        className="delete-btn"
                      >
                        ❌
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="affectations-section">
        <h3>🔗 Affectations des Enseignants</h3>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Enseignant</th>
                <th>Sous-classe</th>
                <th>Matière</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {affectations.map(affectation => (
                <tr key={affectation.id}>
                  <td>{affectation.enseignant_prenom} {affectation.enseignant_nom}</td>
                  <td>{affectation.sous_classe_nom} - {affectation.classe_nom}</td>
                  <td>{affectation.matiere_nom}</td>
                  <td>
                    <button 
                      onClick={() => deleteAffectation(affectation.id)}
                      className="delete-btn"
                    >
                      ❌
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const ClasseManager: React.FC = () => {
  const [classes, setClasses] = useState<Classe[]>([]);
  const [sousClasses, setSousClasses] = useState<SousClasse[]>([]);
  const [showAddClasse, setShowAddClasse] = useState(false);
  const [showAddSousClasse, setShowAddSousClasse] = useState(false);
  const [editingClasse, setEditingClasse] = useState<Classe | null>(null);
  const [editingSousClasse, setEditingSousClasse] = useState<SousClasse | null>(null);
  const [newClasse, setNewClasse] = useState({ nom: '' });
  const [newSousClasse, setNewSousClasse] = useState({ nom: '', classe_id: '' });
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchClasses();
    fetchSousClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/classes');
      setClasses(response.data.classes);
    } catch (error) {
      console.error('Erreur fetch classes:', error);
    }
  };

  const fetchSousClasses = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/sous-classes');
      setSousClasses(response.data.sous_classes);
    } catch (error) {
      console.error('Erreur fetch sous-classes:', error);
    }
  };

  const addClasse = async () => {
    if (!newClasse.nom) {
      setMessage('❌ Veuillez remplir le nom de la classe');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    try {
      await axios.post('http://localhost:5000/api/classes', newClasse);
      
      setNewClasse({ nom: '' });
      setShowAddClasse(false);
      fetchClasses();
      setMessage('✅ Classe créée avec succès');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Erreur création classe:', error);
      setMessage('❌ Erreur lors de la création de la classe');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const updateClasse = async () => {
    if (!editingClasse) return;

    try {
      await axios.put(`http://localhost:5000/api/classes/${editingClasse.id}`, {
        nom: editingClasse.nom
      });
      
      setEditingClasse(null);
      fetchClasses();
      setMessage('✅ Classe modifiée avec succès');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Erreur modification classe:', error);
      setMessage('❌ Erreur lors de la modification de la classe');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const deleteClasse = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette classe ?')) {
      try {
        await axios.delete(`http://localhost:5000/api/classes/${id}`);
        
        fetchClasses();
        fetchSousClasses();
        setMessage('✅ Classe supprimée avec succès');
        setTimeout(() => setMessage(''), 3000);
      } catch (error: any) {
        console.error('Erreur suppression classe:', error);
        setMessage(error.response?.data?.error || '❌ Erreur lors de la suppression');
        setTimeout(() => setMessage(''), 3000);
      }
    }
  };

  const addSousClasse = async () => {
    if (!newSousClasse.nom || !newSousClasse.classe_id) {
      setMessage('❌ Veuillez remplir tous les champs');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    try {
      await axios.post('http://localhost:5000/api/sous-classes', {
        nom: newSousClasse.nom,
        classe_id: Number(newSousClasse.classe_id)
      });
      
      setNewSousClasse({ nom: '', classe_id: '' });
      setShowAddSousClasse(false);
      fetchSousClasses();
      setMessage('✅ Sous-classe créée avec succès');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Erreur création sous-classe:', error);
      setMessage('❌ Erreur lors de la création de la sous-classe');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const updateSousClasse = async () => {
    if (!editingSousClasse) return;

    try {
      await axios.put(`http://localhost:5000/api/sous-classes/${editingSousClasse.id}`, {
        nom: editingSousClasse.nom,
        classe_id: editingSousClasse.classe_id
      });
      
      setEditingSousClasse(null);
      fetchSousClasses();
      setMessage('✅ Sous-classe modifiée avec succès');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Erreur modification sous-classe:', error);
      setMessage('❌ Erreur lors de la modification de la sous-classe');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const deleteSousClasse = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette sous-classe ?')) {
      try {
        await axios.delete(`http://localhost:5000/api/sous-classes/${id}`);
        
        fetchSousClasses();
        setMessage('✅ Sous-classe supprimée avec succès');
        setTimeout(() => setMessage(''), 3000);
      } catch (error: any) {
        console.error('Erreur suppression sous-classe:', error);
        setMessage(error.response?.data?.error || '❌ Erreur lors de la suppression');
        setTimeout(() => setMessage(''), 3000);
      }
    }
  };

  const startEditClasse = (classe: Classe) => {
    setEditingClasse({...classe});
    setShowAddClasse(false);
  };

  const startEditSousClasse = (sousClasse: SousClasse) => {
    setEditingSousClasse({...sousClasse});
    setShowAddSousClasse(false);
  };

  const cancelEditClasse = () => {
    setEditingClasse(null);
  };

  const cancelEditSousClasse = () => {
    setEditingSousClasse(null);
  };

  return (
    <div className="classe-manager">
      <h2>🏫 Gestion des Classes et Sous-Classes</h2>
      
      {message && (
        <div className={`message ${message.includes('❌') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}
      
      <div className="management-actions">
        <button 
          onClick={() => {
            setShowAddClasse(!showAddClasse);
            setEditingClasse(null);
          }}
          className="toggle-form-btn"
        >
          {showAddClasse ? '❌ Annuler' : '➕ Nouvelle Classe'}
        </button>
        <button 
          onClick={() => {
            setShowAddSousClasse(!showAddSousClasse);
            setEditingSousClasse(null);
          }}
          className="toggle-form-btn"
        >
          {showAddSousClasse ? '❌ Annuler' : '🔹 Nouvelle Sous-Classe'}
        </button>
      </div>

      {/* Formulaire Classe */}
      {(showAddClasse || editingClasse) && (
        <div className="add-form">
          <h3>{editingClasse ? '✎ Modifier la Classe' : '➕ Nouvelle Classe'}</h3>
          <div className="form-group">
            <input
              type="text"
              placeholder="Nom de la classe"
              value={editingClasse ? editingClasse.nom : newClasse.nom}
              onChange={(e) => editingClasse
                ? setEditingClasse({...editingClasse, nom: e.target.value})
                : setNewClasse({...newClasse, nom: e.target.value})
              }
            />
          </div>
          <div className="form-actions">
            {editingClasse ? (
              <>
                <button onClick={updateClasse} className="add-btn">💾 Modifier la classe</button>
                <button onClick={cancelEditClasse} className="cancel-btn">❌ Annuler</button>
              </>
            ) : (
              <button onClick={addClasse} className="add-btn">➕ Créer la classe</button>
            )}
          </div>
        </div>
      )}

      {/* Formulaire Sous-Classe */}
      {(showAddSousClasse || editingSousClasse) && (
        <div className="add-form">
          <h3>{editingSousClasse ? '✎ Modifier la Sous-Classe' : '🔹 Nouvelle Sous-Classe'}</h3>
          <div className="form-row">
            <div className="form-group">
              <input
                type="text"
                placeholder="Nom de la sous-classe"
                value={editingSousClasse ? editingSousClasse.nom : newSousClasse.nom}
                onChange={(e) => editingSousClasse
                  ? setEditingSousClasse({...editingSousClasse, nom: e.target.value})
                  : setNewSousClasse({...newSousClasse, nom: e.target.value})
                }
              />
            </div>
            <div className="form-group">
              <select
                value={editingSousClasse ? editingSousClasse.classe_id.toString() : newSousClasse.classe_id}
                onChange={(e) => editingSousClasse
                  ? setEditingSousClasse({...editingSousClasse, classe_id: Number(e.target.value)})
                  : setNewSousClasse({...newSousClasse, classe_id: e.target.value})
                }
              >
                <option value="">Sélectionner une classe</option>
                {classes.map(classe => (
                  <option key={classe.id} value={classe.id}>
                    {classe.nom}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-actions">
            {editingSousClasse ? (
              <>
                <button onClick={updateSousClasse} className="add-btn">💾 Modifier la sous-classe</button>
                <button onClick={cancelEditSousClasse} className="cancel-btn">❌ Annuler</button>
              </>
            ) : (
              <button onClick={addSousClasse} className="add-btn">🔹 Créer la sous-classe</button>
            )}
          </div>
        </div>
      )}

      <div className="sections-container">
        {/* Section Classes */}
        <div className="classes-section">
          <h3>📋 Liste des Classes</h3>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {classes.map(classe => (
                  <tr key={classe.id}>
                    <td>{classe.nom}</td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          onClick={() => startEditClasse(classe)}
                          className="edit-btn"
                        >
                          🔄
                        </button>
                        <button 
                          onClick={() => deleteClasse(classe.id)}
                          className="delete-btn"
                        >
                          ❌
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section Sous-Classes */}
        <div className="sous-classes-section">
          <h3>📚 Liste des Sous-Classes</h3>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Classe</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sousClasses.map(sousClasse => (
                  <tr key={sousClasse.id}>
                    <td>{sousClasse.nom}</td>
                    <td>{sousClasse.classe_nom}</td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          onClick={() => startEditSousClasse(sousClasse)}
                          className="edit-btn"
                        >
                          🔄
                        </button>
                        <button 
                          onClick={() => deleteSousClasse(sousClasse.id)}
                          className="delete-btn"
                        >
                          ❌
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

const Navigation: React.FC = () => {
  const navigate = useNavigate();

  return (
    <nav className="navigation">
      <div className="nav-brand">
        <h2>🏛️ Gestion Scolaire Pro</h2>
      </div>
      <div className="nav-links">
        <div className="nav-menu">
          <button onClick={() => navigate('/')}>📈 Tableau de Bord</button>
          <button onClick={() => navigate('/presences')}>📅 Gestion Présences</button>
          <button onClick={() => navigate('/eleves')}>👨‍🎓 Gestion Élèves</button>
          <button onClick={() => navigate('/notes')}>🎯 Gestion Notes</button>
          <button onClick={() => navigate('/enseignants')}>👨‍🏫 Gestion Enseignants</button>
          <button onClick={() => navigate('/classes')}>🏫 Gestion Classes</button>
        </div>
      </div>
    </nav>
  );
};

// Composant principal
const App: React.FC = () => {
  return (
    <Router>
      <div className="App">
        <Navigation />
        <div className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/presences" element={<PresenceManager />} />
            <Route path="/eleves" element={<EleveManager />} />
            <Route path="/notes" element={<NoteManager />} />
            <Route path="/enseignants" element={<EnseignantManager />} />
            <Route path="/classes" element={<ClasseManager />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;