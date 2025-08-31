import { motion } from "motion/react";
import { Card } from "../Shad";
import { useState } from "react";
import { Providers } from "./Providers";
import { EmailAuth } from "./EmailAuth";
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

export const Auth = () => {
  const [switchEmail, setSwitchEmail] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [authType, setAuthType] = useState<"signin" | "signup">(() => {
    const mode = searchParams.get('mode');
    return (mode === 'signup' || mode === 'signin') ? mode : 'signin';
  });

  useEffect(() => {
    const mode = searchParams.get('mode');
    if (mode === 'signup' || mode === 'signin') {
      setAuthType(mode);
    }
  }, [searchParams]);

  const handleMethodSwitch = (method: "email" | "social") => {
    setSwitchEmail(method === "email");
  };

  const handleAuthTypeSwitch = (type: "signin" | "signup") => {
    setAuthType(type);
    setSearchParams({ mode: type });
  };

  return (
    <Card className="flex min-h-[calc(100vh-100px)] items-center justify-center border-none">
      <motion.div
        initial={{}}
        className=""
      >
        {!switchEmail 
          ? (
            <Providers 
              authType={authType}
              onMethodSwitch={handleMethodSwitch}
              onAuthTypeSwitch={handleAuthTypeSwitch}
            />
          )
          : (
            <EmailAuth 
              authType={authType}
              onMethodSwitch={handleMethodSwitch}
              onAuthTypeSwitch={handleAuthTypeSwitch}
            />
          )
        }
      </motion.div>
    </Card>
  );
};