"use client";

import { useState } from "react";
import { Input } from "./input";

interface EmailLoginFormProps {
  onLogin: (email: string, password: string) => void;
  onRegister: (email: string, password: string, username: string) => void;
  loading: boolean;
  loginError?: string;
  registerError?: string;
}

export default function EmailLoginForm({
  onLogin,
  onRegister,
  loading,
  loginError,
  registerError,
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
      {/* Display specific errors */}
      {isRegistering && registerError && (
        <div className="text-red-400 text-xs text-center bg-red-900/20 p-2 rounded">
          {registerError}
        </div>
      )}
      {!isRegistering && loginError && (
        <div className="text-red-400 text-xs text-center bg-red-900/20 p-2 rounded">
          {loginError}
        </div>
      )}
      
      <div className="flex flex-col gap-2">
        {isRegistering && (
          <div className="flex flex-col gap-1">
            <Input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
               
              disabled={loading}
              required={isRegistering}
              className={"nes-input"}
            />
             
          </div>
        )}

        <div className="flex flex-col gap-1">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)} 
            disabled={loading}
            required
            className={`nes-input`} 
          />
          
        </div>

        <div className="flex flex-col gap-1">
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            required
            className={`nes-input`}
          />
          
        </div>
      </div>
      <button
        type="submit"
        disabled={
          loading || 
          !email || 
          !password || 
          (isRegistering && !username) 

        }
        className="w-full nes-btn text-xs sm:text-sm md:text-base px-4 sm:px-6 md:px-8 lg:px-10 py-2 sm:py-3 md:py-4 lg:py-5 game-button nes-btn cursor-pointer"
      >
        {loading
          ? isRegistering
            ? "Registering..."
            : "Logging In..."
          : isRegistering
          ? "Register"
          : "Login"}
      </button>

      <div
        onClick={toggleMode}
        className="w-full text-xs sm:text-sm md:text-base game-button cursor-pointer underline text-center text-gray-400 hover:text-white"
        style={{ fontSize: "12px" }}
      >
        {isRegistering
          ? "Already have an account? Login"
          : "Don't have an account? Register"}
      </div>
    </form>
  );
}
