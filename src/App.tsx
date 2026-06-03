import { lazy, Suspense } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import Landing from "@/pages/landing";
import About from "@/pages/about";
const Home = lazy(() => import("@/pages/home"));
import Success from "@/pages/success";
import Shared from "@/pages/shared";
import Login from "@/pages/login";
import Signup from "@/pages/signup";
import AuthCallback from "@/pages/auth-callback";
const Collections = lazy(() => import("@/pages/collections"));
const CollectionDetail = lazy(() => import("@/pages/collection-detail"));
const ForgotPassword = lazy(() => import("@/pages/forgot-password"));
const NotFound = lazy(() => import("@/pages/not-found"));
const FixPage = lazy(() => import("@/pages/fix"));
const Privacy = lazy(() => import("@/pages/privacy"));
const Terms = lazy(() => import("@/pages/terms"));

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/check">{() => <Suspense fallback={<div style={{ background: "hsl(220 8% 9%)", minHeight: "100vh" }} />}><Home /></Suspense>}</Route>
      <Route path="/about" component={About} />
      <Route path="/success" component={Success} />
      <Route path="/s/:id" component={Shared} />
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/auth/callback" component={AuthCallback} />
      <Route path="/collections">{() => <Suspense fallback={<div style={{ background: "hsl(220 8% 9%)", minHeight: "100vh" }} />}><Collections /></Suspense>}</Route>
      <Route path="/collections/:id">{() => <Suspense fallback={<div style={{ background: "hsl(220 8% 9%)", minHeight: "100vh" }} />}><CollectionDetail /></Suspense>}</Route>
      <Route path="/forgot-password">{() => <Suspense fallback={<div style={{ background: "hsl(220 8% 9%)", minHeight: "100vh" }} />}><ForgotPassword /></Suspense>}</Route>
      <Route path="/privacy">{() => <Suspense fallback={<div style={{ background: "hsl(220 8% 9%)", minHeight: "100vh" }} />}><Privacy /></Suspense>}</Route>
      <Route path="/terms">{() => <Suspense fallback={<div style={{ background: "hsl(220 8% 9%)", minHeight: "100vh" }} />}><Terms /></Suspense>}</Route>
      <Route path="/fix/:slug">{() => <Suspense fallback={<div style={{ background: "hsl(220 8% 9%)", minHeight: "100vh" }} />}><FixPage /></Suspense>}</Route>
      <Route>{() => <Suspense fallback={<div style={{ background: "hsl(220 8% 9%)", minHeight: "100vh" }} />}><NotFound /></Suspense>}</Route>
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