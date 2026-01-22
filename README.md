# 📚 BOOX - Book Explorer

BOOX est un book explorer une application web **React + TypeScript** pour rechercher des livres via **Open Library**, consulter une fiche détaillée, gérer des **favoris** ❤️, marquer des livres **lus** ✅, et explorer des **catégories**.  
Le tout avec une UX fluide (scroll infini, restauration du scroll, suggestions, etc.).

---

## ✨ Fonctionnalités

### Recherche
- Recherche de livres (titre / auteur / mots-clés / sujets)
- **Scroll infini** sur les résultats
- Gestion des erreurs + boutons **Réessayer**
- Message de fin de résultats
- Historique de recherche (persisté)

### Exploration
- Page d’accueil avec **catégories** affichées en **scroll horizontal**
- Navigation vers une catégorie (recherche automatique)

### Fiche livre (Book Detail)
- Couverture, description, auteurs, sujets cliquables (recherche sur sujet)
- Boutons :
  - **Favori** ❤️
  - **Marquer comme Lu** ✅
- **Notes Open Library** (étoiles + votes + barres si dispo)

### Favoris & Lu
- Page **Favoris** : tri + filtre (UI améliorée)
- Page **Lu** : tri + filtre + note personnelle + commentaire (si activé côté projet)

### UX / Qualité
- **Restauration de scroll** au retour vers la recherche (pas de “retour tout en haut”)
- Persistance via `localStorage` / `sessionStorage` selon les besoins

---

## 🧱 Tech Stack

- **React** + **TypeScript**
- **React Router**
- **Tailwind CSS**
- Open Library API (Search / Works / Authors / Ratings)
- **Vitest + Testing Library + MSW** pour les tests

---

## 🚀 Démarrage rapide

### Prérequis
- Node.js (>= 18 recommandé)
- npm

### Installation
```bash
npm install
