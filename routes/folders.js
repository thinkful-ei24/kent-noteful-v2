'use strict';

const express = require('express');
const router = express.Router();
const knex = require('../knex');

// Read all folders
router.get('/', (req, res, next) => {
  knex.select()
    .from('folders')
    .then(results => res.json(results))
    .catch(err => next(err));
});

// Find folder by id
router.get('/:id', (req, res, next) => {
  const id = req.params.id;
  knex
    .first()
    .from('folders')
    .where({id})
    .then(item => item ? res.json(item) : next())
    .catch(err => next(err));
});

// Create folder
router.post('/', (req, res, next) => {
  const { name } = req.body;

  const newItem = { name };
  /***** Never trust users - validate input *****/
  if (!newItem.name) {
    const err = new Error('Missing `name` in request body');
    err.status = 400;
    return next(err);
  }
  knex('folders')
    .insert(newItem)
    .returning(['id', 'name'])
    .then(result => result[0])
    .then(item => {
      if (item) {
        res.location(`http://${req.headers.host}/folders/${item.id}`).status(201).json(item);
      }
    })
    .catch(err => next(err));
});

// Update folder
router.put('/:id', (req, res, next) => {
  const id = req.params.id;

  /***** Never trust users - validate input *****/
  const updateObj = {};
  const field = 'name';

  if (field) {
    updateObj[field] = req.body[field];
  }

  /***** Never trust users - validate input *****/
  if (!updateObj.name) {
    const err = new Error('Missing `name` in request body');
    err.status = 400;
    return next(err);
  }

  knex('folders')
    .update(updateObj)
    .where({id: id})
    .returning(['id', 'name'])
    .then(result => result[0])
    .then(item => {
      if (item) {
        res.json(item);
      } else {
        next();
      }
    })
    .catch(err => {
      next(err);
    });
});

// Delete folder
router.delete('/:id', (req, res, next) => {
  const id = req.params.id;

  knex('folders').del().where({id})
    .then(() => res.sendStatus(204))
    .catch(err => next(err));
});

module.exports = router;