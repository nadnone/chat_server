# chat_server
Ce projet est une archive d'un petit chat que j'avais crée en 2018

# Utilisations

- ne pas oublier de modifier le certificat à la ligne 13 et 9 de main.js
- ne pas oublier de mettre ses identifiant postgresql et mot de passe dans func/database.js à la ligne 5

- /!\ créer une table dans votre serveur postgresql s'appellant `chat_comptes` et y ajouter les champs suivant:
    - picture => contiendra un url (text)
    - username -> varchar
    - isAdmin => booléen
    - password -> varchar

- finalement, pour installer le tout, via votre console, faite un `npm install` puis `node main.js` (à la racine du dossier projet)
Il est possible qu'il y ai quelques soucis de packages étant donnée l'ancienneté du projet
- je doute que je maintienne ce chat à l'avenir