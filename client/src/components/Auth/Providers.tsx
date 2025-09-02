import { Card, CardContent, CardHeader, CardTitle, Separator } from "../Shad";
import { Link } from "react-router-dom";
import { Button } from "../Shad";
import type React from "react";
import { useAuth } from "../../context/AuthContext";

interface ProvidersProps {
  authType: "signin" | "signup";
  onMethodSwitch: (method: "email" | "social") => void;
  onAuthTypeSwitch: (type: "signin" | "signup") => void;
}

export const Providers = ({ authType, onMethodSwitch, onAuthTypeSwitch }: ProvidersProps) => {
  const {loginOAuth} = useAuth();
  if(!loginOAuth) return <div>Loading...</div>
  const handleAuthProviders = (provider: "google" | "github" | "email") => {
    if (provider === "email") {
      onMethodSwitch("email");
    } else {
      loginOAuth(provider);
    }
  };

  return (
    <Card className="border-none p-6 bg-slate-100/90 dark:bg-slate-700" >
      <div className="flex flex-col gap-8">
        <CardHeader className="flex flex-col text-center">
          <CardTitle className="text-4xl font-semibold">
            {authType === "signin" ? "Welcome" : "Join"}{" "}
            <span className="bg-gradient-to-b from-blue-400 to-blue-700 bg-clip-text font-bold tracking-tighter text-transparent">
              {authType === "signin" ? "back" : "Channel"}.
            </span>
          </CardTitle>
        </CardHeader>

        <CardContent className="flex flex-col gap-4 ">
          {Items.map((Item, index) => (
            <Button
              key={index}
              onClick={() => handleAuthProviders(Item.name)}
              className="flex cursor-pointer justify-center gap-2 rounded-xl bg-gradient-to-b from-blue-400 to-blue-700 p-2 text-lg font-medium text-white transition-all duration-300 hover:-translate-y-2"
            >
              {Item.icon}
              Sign {authType === "signin" ? "in" : "up"} with{" "}
              {Item.name[0].toUpperCase() + Item.name.slice(1)}
            </Button>
          ))}
        </CardContent>
      </div>

      <div className="flex w-full flex-col gap-2">
        <div className="mx-auto flex cursor-pointer items-center gap-2">
          <div className="text-md flex flex-col items-center justify-center tracking-tighter md:text-sm">
            {authType === "signin" ? (
              <Button
                onClick={() => onAuthTypeSwitch("signup")}
                className="hover:underline"
              >
                <p>
                  No Account? <u>Create One</u>
                </p>
              </Button>
            ) : (
              <Button
                onClick={() => onAuthTypeSwitch("signin")}
                className="hover:underline"
              >
                <p>
                  Already have an account? <u>Sign In</u>
                </p>
              </Button>
            )}
          </div>
        </div>
        <Separator className="my-2 w-full" />
        <Link
          to={"/"}
          className="mx-auto flex cursor-pointer items-center gap-2"
        >
          <div className="text-md flex flex-col items-center justify-center tracking-tighter md:text-sm">
            <p className="sm:text-balance">
              Click "Sign up" to agree to Channel's <u>Terms of Service</u> and
              acknowledge that
            </p>
            <p className="text-pretty md:text-balance">
              Channel's <u>Privacy Policy</u> applies to you.
            </p>
          </div>
        </Link>
      </div>
    </Card>
  );
};

type ProviderName = "google" | "github" | "email";

interface AuthItem {
  name: ProviderName;
  icon: React.ReactNode;
}

export const GoogleSvg = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      x="0px"
      y="0px"
      width="30"
      height="30"
      viewBox="0 0 48 48"
    >
      <path
        fill="#fbc02d"
        d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12	s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20	s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
      ></path>
      <path
        fill="#e53935"
        d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039	l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
      ></path>
      <path
        fill="#4caf50"
        d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36	c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
      ></path>
      <path
        fill="#1565c0"
        d="M43.611,20.083L43.595,20L42,20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571	c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
      ></path>
    </svg>
  );
};

export const GithubSvg = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      x="0px"
      y="0px"
      width="30"
      height="30"
      viewBox="0 0 30 30"
    >
      <path d="M15,3C8.373,3,3,8.373,3,15c0,5.623,3.872,10.328,9.092,11.63C12.036,26.468,12,26.28,12,26.047v-2.051 c-0.487,0-1.303,0-1.508,0c-0.821,0-1.551-0.353-1.905-1.009c-0.393-0.729-0.461-1.844-1.435-2.526 c-0.289-0.227-0.069-0.486,0.264-0.451c0.615,0.174,1.125,0.596,1.605,1.222c0.478,0.627,0.703,0.769,1.596,0.769 c0.433,0,1.081-0.025,1.691-0.121c0.328-0.833,0.895-1.6,1.588-1.962c-3.996-0.411-5.903-2.399-5.903-5.098 c0-1.162,0.495-2.286,1.336-3.233C9.053,10.647,8.706,8.73,9.435,8c1.798,0,2.885,1.166,3.146,1.481C13.477,9.174,14.461,9,15.495,9 c1.036,0,2.024,0.174,2.922,0.483C18.675,9.17,19.763,8,21.565,8c0.732,0.731,0.381,2.656,0.102,3.594 c0.836,0.945,1.328,2.066,1.328,3.226c0,2.697-1.904,4.684-5.894,5.097C18.199,20.49,19,22.1,19,23.313v2.734 c0,0.104-0.023,0.179-0.035,0.268C23.641,24.676,27,20.236,27,15C27,8.373,21.627,3,15,3z"></path>
    </svg>
  );
};

export const EmailSvg = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="mt-0.5 text-black"
      width="26"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7" />
      <rect x="2" y="4" width="20" height="16" rx="2" />
    </svg>
  );
};

export const Items: AuthItem[] = [
  { name: "google", icon: <GoogleSvg /> },
  { name: "github", icon: <GithubSvg /> },
  { name: "email", icon: <EmailSvg /> },
];