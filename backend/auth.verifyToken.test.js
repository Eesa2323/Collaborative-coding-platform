// tests/auth.verifyToken.test.js

const verifyToken = require('../src/middleware/verifyToken');
const jwt = require('jsonwebtoken');

describe('Auth Middleware — verifyToken', () => {

  const req = {};
  const res = {
    status: jest.fn(() => res),
    json: jest.fn()
  };
  const next = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('rejects missing Authorization header', () => {
    const req = { headers: {} };

    verifyToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test('rejects malformed token', () => {
    const req = {
      headers: { authorization: 'Bearer malformed.token.here' }
    };

    verifyToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test('rejects expired token', () => {
    const expiredToken = jwt.sign(
      { userId: 1 },
      'secret',
      { expiresIn: '-1h' }
    );

    const req = {
      headers: { authorization: `Bearer ${expiredToken}` }
    };

    verifyToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  test('accepts valid token and attaches user', () => {
    const token = jwt.sign(
      { userId: 42 },
      'secret',
      { expiresIn: '1h' }
    );

    const req = {
      headers: { authorization: `Bearer ${token}` }
    };

    verifyToken(req, res, next);

    expect(next).toHaveBeenCalled();
  });

});