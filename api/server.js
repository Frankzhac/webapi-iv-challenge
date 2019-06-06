require('dotenv').config();
const express = require('express');
const helmet = require('helmet');

const db = require('../data/db.js');


const server = express();

server.use(helmet());
server.use(express.json());

server.get('/', (req, res) => {
  res.send('Hello Word');
});

// Endpoint starts below

server.post('/api/users', async (req, res) => {
  const { name, bio, created_at, updated_at } = req.body;
  if (!name || !bio) {
    res.status(400).json({
      errorMessage: "Please provide name and bio for the user."
    });
  }
  // add/save new user in the db

  db.insert({
    name,
    bio,
    created_at,
    updated_at
  })
      .then(response => {
        res.status(201).json(response);
      })
      .catch(err => {
        // console.log(err);
        res.status(500).json({
          success: false,
          error: "There was an error while saving the user to the database",
        });
      });
  // try {
  //   const users = await db.insert(req.body);
  //   const newUsers = await db.find();
  //   res.status(200).json(newUsers)
  // } catch(err) {
  //   console.log(err);
  // }
});


server.get('/api/users', (req, res) => {
  db.find()
    .then(users => {
      res.json({ users });
    })
    .catch(err => {
      // console.log(err);
      res.status(500).json({
        error: "The users information could not be retrieved."
      });
    });
});

server.get('/api/users/:id', (req, res) => {
  const { id } = req.params;
  db.findById(id)
    .then(user => {
      if (user.length === 0) {
        res.status(404).json({
          message: "The user with the specified ID does not exist."
        });
      } else {
        res.json(user);
      }
    })
    .catch(err => {
      console.log(err)
      res.status(500).json({
         error: "The user information could not be retrieved."
      });
    });
});

server.delete('/api/users/:id', (req, res) => {
  const { id } = req.params;

  db.remove(id)
    .then(response => {
      if (response === 0) {
        res.status(404).json({
          message: "The user with the specified ID does not exist."
        });
      } else {
        res.json({
          success: `User with id: ${id} removed from system`
        });
      }
    })
    .catch(err => {
      res.status(500).json({
        error: "The user could not be removed"
      })
    });
});


server.put('/api/users/:id', (req, res) => {
  const { id } = req.params;
  const { name, bio } = req.body;
  if (!name || !bio) {
    res.status(400).json({
      errorMessage: "The user with the specified ID does not exist."
    });
  }

  db.update(id, { name, bio })
    .then(response => {
      if (response == 0) {
        res.status(404).json({
          errorMessage: "Please provide name and bio for the user."
        })
      }

      db.findById(id)
        .then(user => {
          if (user.length === 0) {
            res.status(500).json({
              error: "The user information could not be modified."
            })
          } else {
            res.json(user);
          }
        })
        .catch(err => {
          res.status(200).json({
            errorMessage: "Can't find user by id."
          });
        });
    });
});

module.exports = server;
