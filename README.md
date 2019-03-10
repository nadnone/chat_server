# chat_server

# Utilisations

- ne pas oublier de modifier le certificat à la ligne 13 et 9 de main.js
- ne pas oublier de mettre ses identifiant postgresql et mot de passe dans func/database.js à la ligne 5

- /!\ créer une table dans votre serveur postgresql s'appellant `chat_comptes` et y ajouter les champs suivant:
    - picture => contiendra un url
    - username
    - isAdmin => booléen
    - password

- finalement, pour installer le tout, via votre console, faite un `npm install` puis `node main.js` (à la racine du dossier projet)

