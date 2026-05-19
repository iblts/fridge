import 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
  interface User {
    id: string;
    role_id: number;
  }
  
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role_id: number;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role_id: number;
  }
}