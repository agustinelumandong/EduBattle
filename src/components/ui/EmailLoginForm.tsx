"use client";

import { useState } from "react";
import { Button } from "./button";
import { Input } from "./input";

interface EmailLoginFormProps {
  onLogin: (email: string, password: string) => void;
  onRegister: (email: string, password: string, username: string) => void;
  loading: boolean;
}

export default function EmailLoginForm({
  onLogin,
  onRegister,
  loading,
}: EmailLoginFormProps) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isRegistering) {
      onRegister(email, password, username);
    } else {
      onLogin(email, password);
    }
  };

  const toggleMode = () => {
    setIsRegistering(!isRegistering);
    setEmail("");
    setPassword("");
    setUsername("");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {isRegistering && (
        <Input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={loading}
          required={isRegistering}
          className="nes-input"
        />
      )}

      <Input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={loading}
        required
        className="nes-input"
      />

      <Input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        disabled={loading}
        required
        className="nes-input"
      />

      <Button
        type="submit"
        disabled={
          loading || !email || !password || (isRegistering && !username)
        }
        className="w-full is-primary"
      >
        {loading
          ? isRegistering
            ? "Registering..."
            : "Logging In..."
          : isRegistering
          ? "Register"
          : "Login"}
      </Button>

      <Button
        type="button"
        onClick={toggleMode}
        variant="outline"
        className="w-full text-white border-white hover:bg-white hover:text-black"
      >
        {isRegistering
          ? "Already have an account? Login"
          : "Need an account? Register"}
      </Button>
    </form>
  );
}
