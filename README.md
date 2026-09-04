# Casa AgriSchool — Version 1 (MVP)

Plateforme numérique d'apprentissage et d'accompagnement agricole destinée en priorité aux maraîchers de **Casamance / Ziguinchor**.

**"Former • Anticiper • Accompagner • Réduire les risques de mévente"**

---

## 🏗️ Architecture & Technologies

- **Backend** : Java 21, Spring Boot 3.3.5, Spring Data JPA / Hibernate, Spring Security + JWT, BCrypt, Maven Wrapper (`./mvnw.cmd`).
- **Base de données** : MySQL 8.4 (WampServer local sur le port `3306`), base `casa_agrischool`.
- **Frontend** : React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React, React Router 7, Axios.
- **Documentation API** : Swagger / OpenAPI UI disponible sur `http://localhost:8080/swagger-ui.html`.

---

## 🌟 Les 4 Piliers Implémentés

1. **Apprendre** : Catalogue de formations par culture (Tomate, Piment, Oignon, Gombo), découpage en modules et leçons, suivi de progression, quiz chronométrés notés côté backend (+10 pts par leçon, +20 pts par quiz, +100 pts par formation terminée).
2. **Planifier** : Moteur d'alertes saisonnières ciblées selon les cultures déclarées par le maraîcher et la date calendaire, avec statut lu/non-lu et niveaux de sévérité (URGENCE, ATTENTION, INFO).
3. **Demander** : Forum communautaire avec catégories, identification claire des **experts agricoles certifiés** (ISRA / DRDR), validation de la meilleure réponse (+10 pts par participation).
4. **Suivre** : Tableau de bord maraîcher complet (exploitations, cultures actives, formations suivies, alertes actives, points & badges).

---

## 🚀 Démarrage Rapide

### 1. Backend (Spring Boot)
Depuis le dossier `backend` :
```powershell
.\mvnw.cmd spring-boot:run
```
- API REST : `http://localhost:8080/api`
- Documentation Swagger : `http://localhost:8080/swagger-ui.html`

### 2. Frontend (React + Vite)
Depuis le dossier `frontend` :
```powershell
npm run dev
```
- Application Web : `http://localhost:5173`

---

## 🔑 Comptes de Démonstration (Pré-configurés)

| Profil | Identifiant | Mot de passe | Rôle & Permissions |
|---|---|---|---|
| **Maraîcher** | `maraicher@agrischool.sn` | `passer123` | Gestion d'exploitation, cultures Tomate/Piment, formations, quiz, alertes, forum |
| **Expert Vérifié** | `expert@agrischool.sn` | `passer123` | Réponses avec badge vert ISRA / DRDR, publication d'alertes et cours |
| **Administrateur** | `admin@agrischool.sn` | `passer123` | Back-office complet, statistiques, validation des experts, modération forum |