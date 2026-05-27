import { Switch, Route, Router as WouterRouter } from "wouter";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import About from "@/pages/about";
import Success from "@/pages/success";
import Shared from "@/pages/shared";
import Login from "@/pages/login";
import Signup from "@/pages/signup";
import AuthCallback from "@/pages/auth-callback";
import Collections from "@/pages/collections";
import CollectionDetail from "@/pages/collection-detail";
import ForgotPassword from "@/pages/forgot-password";
import NotFound from "@/pages/not-found";
import Privacy from "@/pages/privacy";
import Terms from "@/pages/terms";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/check" component={Home} />
      <Route path="/about" component={About} />
      <Route path="/success" component={Success} />
      <Route path="/s/:id" component={Shared} />
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/auth/callback" component={AuthCallback} />
      <Route path="/collections" component={Collections} />
      <Route path="/collections/:id" component={CollectionDetail} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/terms" component={Terms} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
      <Router />
    </WouterRouter>
  );
}

export default App;