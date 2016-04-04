"use strict";

/* The only one condition of a snippet is to `export` one thing */

var UserModel = function UserModel(options) {
  this.name = options.name;
  this.surname = options.surname.trim();
};

exports(UserModel);