'use strict';

/* Available parameters inside a phrase:
 - req: 
    The request object
 - res: 
    The response object
 - next: 
    The callback for passing onto the next middleware
 - corbelDriver: 
    A pre-instantiated driver if the endpoint receives an Authorization header
 - domain: 
    Your `domain` ID .
 - require: 
    Reserved word for loading allowed packages or snippets.
 - config: 
    A configuration object that holds your project settings, where you may want to store variables or credentials.
 - metrics:
    Throw events to your keymetrics/newrelic integration. */

var corbel = require('corbel-js');
var _ = require('lodash');

/* Example code

var UserModel = require('snippet-userModel');

//Grabs all the items for a certain user, paginated
function fetchItems(page, pageSize, userId) {
  return corbelDriver
    .resources
    .collection('mydomain:myCollection')
    .get({
      pagination: {
        page: page,
        pageSize: pageSize
      },
      query: [{
        '$eq': {
          'userId': userId
        }
      }]
    });
}

fetchItems(req.query.page, req.query.pageSize, req.params.userId)
  .then(function(response){
    //Send it back, mapped to a model, to the client.
    res.status(200).send(_.map(response.data, UserModel));
  })
  .catch(function(err){
    //Launch an error
    res.status(500).send(err);
  });
 */

res.status(200).send({ hello: 'world' });