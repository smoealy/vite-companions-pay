import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { signUpWithEmail, signInWithEmail } from "@/auth";
import { useNavigate } from "react-router-dom";

interface Props {
  open: boolean;
  onClose: () => void;
}

const EmailAuthModal: React.FC<Props> = ({ open, onClose }) => {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (isSignUp) {
        await signUpWithEmail(email, password);
        toast({ title: "Account created", description: "Welcome to Companions Pay!" });
      } else {
        await signInWithEmail(email, password);
        toast({ title: "Signed in", description: "Welcome back!" });
      }
      navigate("/dashboard");
      onClose();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isSignUp ? "Sign Up" : "Login"} with Email</DialogTitle>
        </DialogHeader>
        <Input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-3"
        />
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-4"
        />
        <Button onClick={handleSubmit} disabled={loading} className="w-full">
          {loading ? "Loading..." : isSignUp ? "Sign Up" : "Login"}
        </Button>
        <button
          className="text-sm text-cp-green-600 mt-2 underline"
          onClick={() => setIsSignUp(!isSignUp)}
        >
          {isSignUp ? "Already have an account? Log in" : "Don't have an account? Sign up"}
        </button>
      </DialogContent>
    </Dialog>
  );
};

export default EmailAuthModal;
