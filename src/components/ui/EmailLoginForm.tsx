"use client";

import { useEffect, useState } from "react";
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
  
  // Validation states
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [usernameTouched, setUsernameTouched] = useState(false);
  
  // Validation errors
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [usernameError, setUsernameError] = useState(false);
  
  // Validate email format
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  // Validate inputs when they change
  useEffect(() => {
    if (emailTouched) {
      const isEmailEmpty = email.trim() === '';
      const hasEmailFormatError = !validateEmail(email);
      setEmailError(isEmailEmpty || hasEmailFormatError);
    }
    
    if (passwordTouched) {
      const isPasswordEmpty = password.trim() === '';
      const hasPasswordLengthError = password.length < 6;
      setPasswordError(isPasswordEmpty || hasPasswordLengthError);
    }
    
    if (usernameTouched && isRegistering) {
      const isUsernameEmpty = username.trim() === '';
      const hasUsernameLengthError = username.length < 3;
      setUsernameError(isUsernameEmpty || hasUsernameLengthError);
    }
  }, [email, password, username, emailTouched, passwordTouched, usernameTouched, isRegistering]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mark all fields as touched to trigger validation
    setEmailTouched(true);
    setPasswordTouched(true);
    if (isRegistering) {
      setUsernameTouched(true);
    }
    
    // Check for empty fields first
    const isEmailEmpty = email.trim() === '';
    const isPasswordEmpty = password.trim() === '';
    const isUsernameEmpty = isRegistering && username.trim() === '';
    
    // Then check for validation errors
    const hasEmailFormatError = !validateEmail(email);
    const hasPasswordLengthError = password.length < 6;
    const hasUsernameLengthError = isRegistering && username.length < 3;
    
    // Combine empty and format errors
    const hasEmailError = isEmailEmpty || hasEmailFormatError;
    const hasPasswordError = isPasswordEmpty || hasPasswordLengthError;
    const hasUsernameError = isUsernameEmpty || hasUsernameLengthError;
    
    // Update error states
    setEmailError(hasEmailError);
    setPasswordError(hasPasswordError);
    setUsernameError(hasUsernameError);
    
    // Only proceed if there are no errors
    if (!hasEmailError && !hasPasswordError && !(isRegistering && hasUsernameError)) {
      if (isRegistering) {
        onRegister(email, password, username);
      } else {
        onLogin(email, password);
      }
    }
  };

  const toggleMode = () => {
    setIsRegistering(!isRegistering);
    setEmail("");
    setPassword("");
    setUsername("");
    
    // Reset validation states
    setEmailTouched(false);
    setPasswordTouched(false);
    setUsernameTouched(false);
    setEmailError(false);
    setPasswordError(false);
    setUsernameError(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex flex-col gap-2">
        {isRegistering && (
          <div className="flex flex-col gap-1">
            <Input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onBlur={() => setUsernameTouched(true)}
              disabled={loading}
              required={isRegistering}
              className={`nes-input ${usernameError ? 'is-error' : ''}`}
              aria-invalid={usernameError}
            />
            {usernameError && (
              <span className="text-red-500 text-xs">
                {username.trim() === '' ? 'Username is required' : 'Username must be at least 3 characters'}
              </span>
            )}
          </div>
        )}

        <div className="flex flex-col gap-1">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => setEmailTouched(true)}
            disabled={loading}
            required
            className={`nes-input ${emailError ? 'is-error' : ''}`}
            aria-invalid={emailError}
          />
          {emailError && (
            <span className="text-red-500 text-xs">
              {email.trim() === '' ? 'Email is required' : 'Please enter a valid email address'}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={() => setPasswordTouched(true)}
            disabled={loading}
            required
            className={`nes-input ${passwordError ? 'is-error' : ''}`}
            aria-invalid={passwordError}
          />
          {passwordError && (
            <span className="text-red-500 text-xs">
              {password.trim() === '' ? 'Password is required' : 'Password must be at least 6 characters'}
            </span>
          )}
        </div>
      </div>
      <button
        type="submit"
        disabled={
          loading || 
          !email || 
          !password || 
          (isRegistering && !username) ||
          emailError ||
          passwordError ||
          (isRegistering && usernameError)
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
