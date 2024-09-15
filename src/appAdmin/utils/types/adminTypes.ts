// verify password props interface
interface IVerifyPassProps {
  pass: string;
  userId: number;
  table: string;
  passField: string;
  userIdField: string;
}

// change password props interface
interface IChangePassProps {
  password: string;
  table: string;
  passField: string;
  userIdField: string;
  userId: number;
}

// forget password props interface
export interface IForgetPassProps {
  password: string;
  table: string;
  passField: string;
  userEmailField: string;
  userEmail: string;
}
