import { TEST_DISPATCH } from './types';

// Register User
export const registerUser = userData => {
  return {
    type: TEST_DISPATCH, // A type is a must **
    payload: userData
  };
};
