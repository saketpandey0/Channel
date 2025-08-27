import { motion } from "motion/react";
import { Button, Input, Label } from "../shad";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import type React from "react";

interface EmailAuthProps {
  authType: "signin" | "signup";
  onMethodSwitch: (method: "email" | "social") => void;
  onAuthTypeSwitch: (type: "signin" | "signup") => void;
}

export const EmailAuth = ({
  authType,
  onMethodSwitch,
  onAuthTypeSwitch,
}: EmailAuthProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { AuthEmail, getCurrentUser } = useAuth();

  const handleEmailAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    console.log("authType: ",authType)
    if (!email || !password || !authType) {
      setError("Please fill in all fields");
      return;
    }
    AuthEmail.mutate(
      {
        email,
        password,
        authType,
      },
      {
        onSuccess: () => {
          navigate("/stories");
        },
        onError: (error: any) => {
          setError(
            error.response?.data?.message ||
              "Authentication failed. Please try again.",
          );
        },
      },
    );
  };

  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <form
        onSubmit={handleEmailAuth}
        className="shadow-primary/5 m-4 flex min-w-[40vw] flex-col justify-between gap-12 rounded-2xl border border-none bg-slate-100/9 p-6 shadow-xl"
      >
        <div className="flex flex-col items-center justify-center gap-2">
          <motion.div
            whileHover={{
              rotateX: 20,
              rotateY: 10,
              scale: 1.05,
            }}
            style={{
              translateZ: 100,
            }}
            transition={{
              duration: 0.1,
              ease: "easeInOut",
            }}
          >
            <EmailSvg />
          </motion.div>

          <h1 className="font-Bodoni pt-4 text-xl font-bold md:pt-6 md:text-2xl">
            {authType === "signin" ? "Sign in" : "Sign up"} with email
          </h1>

          {error && (
            <div className="mt-2 w-full rounded border border-red-200 bg-red-50 p-2 text-center text-sm text-red-500">
              {error}
            </div>
          )}

          <div className="flex w-full flex-col items-start justify-start pt-2 pb-6 pl-10 md:pt-4 md:pl-20 lg:pl-22">
            <Label htmlFor="emailInput" className="text-sm md:text-base">
              Your email
            </Label>
            <Input
              id="emailInput"
              type="email"
              className="mt-2 flex w-4/5 items-center justify-center rounded border p-2"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Label
              htmlFor="passwordInput"
              className="pt-4 text-sm md:text-base"
            >
              Password
            </Label>
            <Input
              id="passwordInput"
              type="password"
              className="mt-2 flex w-4/5 items-center justify-center rounded border p-2"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col items-center justify-center gap-5 text-sm">
            <Button
              type="submit"
              variant={"secondary"}
              className="md:text-md flex min-w-[20vw] cursor-pointer items-center justify-center rounded-3xl bg-black font-medium text-white"
              disabled={AuthEmail.isPending}
            >
              {AuthEmail.isPending
                ? "Loading..."
                : authType === "signin"
                  ? "Continue"
                  : "Create account"}
            </Button>
            <Button
              type="button"
              onClick={() => onMethodSwitch("social")}
              className="mx-auto flex cursor-pointer items-center justify-center hover:underline"
              disabled={AuthEmail.isPending}
            >
              <u>
                Back to {authType === "signin" ? "sign in" : "sign up"} options
              </u>
            </Button>

            {authType === "signup" && (
              <span>
                Already have an account?{" "}
                <Button
                  type="button"
                  onClick={() => onAuthTypeSwitch("signin")}
                  className="hover:underline"
                  disabled={AuthEmail.isPending}
                >
                  <u>Sign in</u>
                </Button>
              </span>
            )}
            {authType === "signin" && (
              <span>
                Don't have an account?{" "}
                <Button
                  type="button"
                  onClick={() => onAuthTypeSwitch("signup")}
                  className="hover:underline"
                  disabled={AuthEmail.isPending}
                >
                  <u>Sign up</u>
                </Button>
              </span>
            )}
          </div>
          <div className="flex flex-col items-center gap-1 py-2 text-xs font-normal text-slate-600/70">
            <span>This site is protected by reCAPTCHA Enterprise and the</span>
            <span>
              <Link to={"https://policies.google.com/privacy"}>
                <u>Google Privacy Policy</u>{" "}
              </Link>
              and{" "}
              <Link to={"https://policies.google.com/terms"}>
                <u>Terms of Service</u>{" "}
              </Link>
              apply.
            </span>
          </div>
        </div>
      </form>
    </div>
  );
};

const EmailSvg = () => {
  return (
    <motion.div initial={{}} animate={{}} className="flex justify-center">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        version="1.0"
        width="31.000000pt"
        height="39.000000pt"
        viewBox="0 0 331.000000 339.000000"
        preserveAspectRatio="xMidYMid meet"
      >
        <g
          transform="translate(0.000000,339.000000) scale(0.100000,-0.100000)"
          fill="#000000"
          stroke="none"
        >
          <path d="M745 3158 c-42 -15 -81 -44 -105 -77 -21 -30 -420 -1375 -420 -1417 0 -38 36 -123 62 -144 12 -11 34 -27 48 -34 43 -24 882 -267 909 -264 20 2 27 9 29 32 2 16 -1 33 -6 38 -5 5 -205 67 -443 137 -239 70 -434 132 -433 137 1 8 123 86 538 346 193 120 226 144 226 166 0 24 -19 42 -44 42 -12 0 -50 -19 -86 -41 -248 -158 -699 -439 -704 -439 -3 0 -6 8 -6 18 0 18 332 1160 348 1196 7 17 23 1 113 -109 57 -70 232 -286 389 -479 l286 -351 78 -40 c74 -38 83 -40 165 -39 84 0 99 4 654 188 313 103 570 186 572 184 2 -1 -41 -154 -95 -338 -55 -184 -99 -347 -100 -362 0 -17 7 -31 20 -38 35 -19 57 4 79 78 175 592 231 791 231 819 0 57 -38 131 -84 162 -32 22 -273 97 -1071 331 -567 167 -1050 304 -1075 306 -25 2 -58 -2 -75 -8z m1106 -378 c563 -165 1035 -306 1048 -313 49 -25 81 -119 49 -145 -11 -8 -333 -115 -1020 -338 -109 -35 -216 -64 -238 -64 -54 0 -140 34 -183 73 -63 56 -807 980 -807 1003 0 20 42 67 70 77 8 3 24 6 36 6 12 1 482 -134 1045 -299z" />
          <path d="M2080 1799 c-10 -17 2 -49 76 -205 48 -101 93 -189 101 -196 21 -17 63 6 63 34 0 25 -144 342 -168 371 -21 23 -59 22 -72 -4z" />
          <path d="M2105 1246 c-506 -90 -928 -166 -938 -171 -20 -9 -31 -45 -22 -74 4 -13 45 -41 113 -77 59 -32 139 -74 177 -95 l70 -38 -1 -58 c0 -82 -14 -368 -20 -431 -5 -46 -2 -57 17 -78 12 -13 33 -24 47 -24 36 0 382 217 382 240 0 65 -36 65 -142 0 -44 -28 -82 -49 -84 -48 -3 4 112 198 125 211 4 4 39 -13 77 -39 38 -26 147 -101 242 -166 184 -126 212 -137 249 -95 11 12 67 92 125 177 116 172 240 354 425 625 172 252 177 260 163 284 -8 16 -20 21 -48 20 -20 -1 -451 -74 -957 -163z m310 -181 c-209 -113 -433 -233 -497 -267 -113 -61 -118 -65 -160 -132 -24 -39 -45 -75 -48 -80 -15 -33 -122 -206 -127 -206 -5 0 0 116 13 320 3 47 7 85 7 86 1 1 70 27 152 59 298 115 295 114 295 145 0 15 -7 33 -15 40 -16 14 -48 3 -335 -110 -145 -58 -140 -57 -212 -17 -35 19 -91 49 -126 67 -35 18 -60 36 -55 40 4 4 130 29 278 54 149 26 387 67 530 92 561 98 641 112 660 113 11 0 -151 -91 -360 -204z m499 153 c-5 -7 -28 -42 -52 -78 -25 -36 -106 -154 -180 -264 -74 -109 -176 -258 -226 -332 -50 -73 -96 -141 -102 -151 -11 -16 -21 -12 -120 56 -60 41 -160 108 -221 150 -62 42 -113 78 -113 81 0 6 1001 549 1013 549 5 1 5 -5 1 -11z" />
          <path d="M1100 625 c-129 -58 -320 -142 -424 -187 -203 -89 -228 -108 -191 -148 10 -11 21 -20 26 -20 7 0 241 102 683 297 110 48 204 96 210 106 16 25 -4 52 -40 54 -18 1 -115 -36 -264 -102z" />
          <path d="M1190 389 c-180 -83 -199 -97 -182 -134 7 -16 20 -25 34 -25 32 0 346 149 353 168 7 18 -20 62 -38 62 -6 0 -82 -32 -167 -71z" />
        </g>
      </svg>
    </motion.div>
  );
};
