// src/TestAuth.tsx
import { AuthProvider } from "./contexts/AuthContext";

export default function TestAuth() {
  console.log(AuthProvider); // should print a function
  return <div>TestAuth</div>;
}
