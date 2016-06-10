import {
  authenticateAsync,
  AUTH_ERROR_CODES,
  hashPassword,
 } from './authenticationUtils';

import { SETTINGS_KEYS } from '../settings';
const { SYNC_URL } = SETTINGS_KEYS;

const {
   CONNECTION_FAILURE,
   INVALID_PASSWORD,
 } = AUTH_ERROR_CODES;

const AUTH_ENDPOINT = '/mobile/user';

export class UserAuthenticator {
  constructor(database, settings) {
    this.database = database;
    this.settings = settings;
    this.activeUsername = '';
    this.activePassword = '';
  }

/**
 * Check whether the username and password are valid, against the server
 * if internet is available, otherwise against the local cache. On successful
 * authentication, save the details in the database.
 * @param  {string}   username         The username to test
 * @param  {string}   password         The password to test
 * @return {none}
 */
  async authenticate(username, password) {
    if (username.length === 0) throw new Error('Enter a username');
    if (password.length === 0) throw new Error('Enter a password');

    this.activeUsername = username;
    this.activePassword = password;

    // Hash the password
    const passwordHash = hashPassword(password);

    // Get the cached user from the database, if they exist
    const user = this.database.objects('User').filtered('username == $0', username)[0];

    // Get the HTTP endpoint to authenticate against
    const serverURL = this.settings.get(SYNC_URL);
    if (serverURL.length === 0) { // No valid server URL configured, fail early
      throw new Error('Server URL not configured');
    }
    const authURL = `${serverURL}${AUTH_ENDPOINT}`;

    try {
      const userJson = await authenticateAsync(authURL, username, passwordHash);
      if (!userJson || !userJson.UserID) throw new Error('Unexpected response from server');
      else { // Success, save user to database
        this.database.write(() => {
          this.database.update('User', {
            id: userJson.UserID,
            username: username,
            passwordHash: passwordHash,
          });
        });
      }
    } catch (error) {
      if (error === CONNECTION_FAILURE) { // Error with connection, check against local database
        if (!user || user.username !== username || user.passwordHash !== passwordHash) {
          error.setMessage(`${error.message} and username and password not cached`);
          throw error; // User doesn't match cached credentials
        }
      } else if (error === INVALID_PASSWORD) { // Password not valid
        if (user && user.passwordHash === passwordHash) {
          // Clear invalid password from db, if saved
          this.database.write(() => {
            user.passwordHash = '';
          });
        }
        throw error;
      } else throw error; // Most likely an empty username or password
    }
  }

/**
 * Check that the user's details are still valid
 * @param  {function} onAuthentication A callback function expecting a boolean
 *                                     parameter that represents the success or
 *                                     failure of reauthentication
 * @return {none}
 */
  reauthenticate(onAuthentication) {
    if (!this.activeUsername | !this.activePassword) onAuthentication(false);
    this.authenticate(this.activeUsername, this.activePassword)
      .then(() => onAuthentication(true),
      () => onAuthentication(false));
  }
}
