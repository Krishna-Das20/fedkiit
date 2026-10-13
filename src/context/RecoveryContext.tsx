"use client";

import React, { createContext, useState, useEffect } from 'react';

type RecoveryState = {
  email: string;
  otp: string;
  teamCode: string | null;
  teamName: string | null;
  successMessage: string | null;
};

export type RecoveryContextValue = RecoveryState & {
  setEmail: (newEmail: string) => void;
  setOTP: (newOTP: string) => void;
  setTeamCode: (newTeamCode: string | null) => void;
  setTeamName: (newTeamName: string | null) => void;
  setSuccessMessage: (newMessage: string | null) => void;
};

const initialContext: RecoveryState = {
  email: '',
  otp: '',
  teamCode: '',
  teamName: '',
  successMessage: ''
};

const noop = () => {};

// Every consumer sits under RecoveryContextProvider (mounted in Providers), so
// this default is never read; it only gives the context its type.
export const RecoveryContext = createContext<RecoveryContextValue>({
  ...initialContext,
  setEmail: noop,
  setOTP: noop,
  setTeamCode: noop,
  setTeamName: noop,
  setSuccessMessage: noop,
});

const RecoveryContextProvider = ({ children }: { children: React.ReactNode }) => {
  // The original seeded this from localStorage inside the useState initialiser.
  // That runs during server rendering under Next.js, where localStorage does not
  // exist, so the stored values are restored in a mount effect instead.
  const [state, setState] = useState(initialContext);

  useEffect(() => {
    const storedEmail = localStorage.getItem('recoveryEmail') || '';
    const storedOTP = localStorage.getItem('recoveryOTP') || '';
    if (storedEmail || storedOTP) {
      setState(prevState => ({
        ...prevState,
        email: storedEmail,
        otp: storedOTP,
      }));
    }
  }, []);

  const setEmail = (newEmail: string) => {
    localStorage.setItem('recoveryEmail', newEmail);
    setState(prevState => ({ ...prevState, email: newEmail }));
  };

  const setOTP = (newOTP: string) => {
    localStorage.setItem('recoveryOTP', newOTP);
    setState(prevState => ({ ...prevState, otp: newOTP }));
  };

  const setTeamCode = (newTeamCode: string | null) => {
    setState(prevState => ({ ...prevState, teamCode: newTeamCode }));
  };

  const setTeamName = (newTeamName: string | null) => {
    setState(prevState => ({ ...prevState, teamName: newTeamName }));
  };

  // useEffect(() => {
  //   return () => {
  //     localStorage.removeItem('recoveryEmail');
  //     localStorage.removeItem('recoveryOTP');
  //   }
  // }, []);

  const setSuccessMessage = (newMessage: string | null) => {
    setState(prevState => ({ ...prevState, successMessage: newMessage }));
  }

  return (
    <RecoveryContext.Provider value={{ ...state, setEmail, setOTP, setTeamCode, setTeamName, setSuccessMessage }}>
      {children}
    </RecoveryContext.Provider>
  );
};

export default RecoveryContextProvider;